import { Server } from 'http';
import * as EventEmitter from 'events';
import * as jwt from 'jsonwebtoken';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { Router, Request, Response, NextFunction } from 'express';

export interface Address {
	port: number;
	family: string;
	address: string;
}

export interface ApplicationConfig {
	jwtSecret: string;
}

export class Application extends EventEmitter {
	private application: express.Application;
	private server: Server;

	private corsHosts: string[] = [
		'http://localhost:4200'
	];

	public get address(): Address {
		if (!this.server) return null;

		let address = this.server.address();

		if (typeof address === 'string') {
			address = {
				port: 0,
				family: '',
				address: address
			};
		}

		return address;
	}

	public constructor(private config: ApplicationConfig) {
		super();

		this.application = express()
		.use(bodyParser.json())
		.use(bodyParser.urlencoded({ extended: false }))
		.use(cookieParser())
		.use(this.cors.bind(this))
		.use(this.auth.bind(this));
	}

	public use(
		router: Router,
		...more: Router[]
	): Application;

	public use(
		urlPath: string,
		router: Router,
		...more: Router[]
	): Application;

	public use(
		urlPath: string | Router,
		router?: Router,
		...more: Router[]
	): Application {
		if (typeof urlPath !== 'string') {
			router = urlPath;
			urlPath = '/';
		}

		this.application.use(urlPath, ...[router, ...more]);

		return this;
	}

	public listen(port: number|string): Promise<Address> {
		if (this.server && this.server.listening)
			return Promise.resolve(this.address);

		port = this.normalizePort(port) || 3000;
		this.application.set('port', port);

		this.emit('init');

		return new Promise<Address>((resolve, reject) => {
			this.server = this.application.listen(port, () => {
				resolve(this.address);
			}).on('error', (error: Error) => reject(error));
		});
	}

	public close(): Promise<void> {
		if (this.server) {
			return new Promise<void>((resolve) => {
				this.server.close(() => {
					this.server = null;
					resolve();
				});
			});
		} else {
			return Promise.reject(new Error('Server is already closed.'));
		}
	}

	private normalizePort(val: number|string): number|string {
		let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;

		return isNaN(port) ? val : port;
	}

	private cors(req: Request, resp: Response, next: NextFunction) {
		let origin = req.headers.origin as string;

		if (this.corsHosts.indexOf(origin) !== -1) {
			resp.header('Access-Control-Allow-Origin', origin);
		}

		resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
			.header('Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept, Authorization')
			.header('Access-Control-Allow-Credentials', 'true')
			.header('Access-Control-Expose-Headers', 'Set-Cookie');

		next();
	}

	private auth(req: Request, resp: Response, next: NextFunction) {
		if (req.method === 'OPTIONS') return next();

		const header = req.header('Authorization');
		if (header === undefined) return resp.sendStatus(401);

		const [scheme, token] = header.split(' ', 2);
		if (scheme != 'Bearer' || token == '') return resp.sendStatus(401);

		jwt.verify(token, this.config.jwtSecret, (err, claims) => {
			if (err) {
				resp.sendStatus(401);
			} else {
				console.log('CLAIMS', claims);
				next();
			}
		});
	}
}
