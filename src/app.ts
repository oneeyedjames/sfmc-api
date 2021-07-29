import { Server } from 'http';
import * as EventEmitter from 'events';
import * as express from 'express';

import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { JwtAuthenticator } from './jwt';

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

	private jwt: JwtAuthenticator;

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

		this.jwt = new JwtAuthenticator({
			issuer: 'SFMC',
			secret: config.jwtSecret
		});

		this.application = express()
		.use(express.urlencoded({ extended: false }))
		.use(express.json())
		.use(cors(this.corsHosts))
		.use(this.jwt.authenticate)
		.use(auth);
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

	public listen(port: number | string): Promise<Address> {
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

	private normalizePort(val: number | string): number | string {
		let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;

		return isNaN(port) ? val : port;
	}
}

function auth(req: Request, resp: Response, next: NextFunction) {
	if (req.method === 'OPTIONS') return next();
	if (req.jwt === undefined) return resp.sendStatus(401);

	// this.jwt.sign(req.jwt.payload.aud, req.jwt.payload).then(jwt => {
	// 	console.log(jwt, this.jwt.decode(jwt));
	// 	next();
	// });

	next();
}

function cors(hosts: string[]): RequestHandler {
	return (req: Request, resp: Response, next: NextFunction) => {
		const origin = req.headers.origin as string;

		if (hosts.indexOf(origin) !== -1)
			resp.header('Access-Control-Allow-Origin', origin);

		resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
			.header('Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept, Authorization')
			.header('Access-Control-Allow-Credentials', 'true')
			.header('Access-Control-Expose-Headers', 'Set-Cookie');

		next();
	}
}
