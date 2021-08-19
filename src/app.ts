import { Server } from 'http';
import * as EventEmitter from 'events';
import * as express from 'express';

import { Router } from 'express';

/**
 * Middleware support for AJAX requests
 * Only use for for development and testing
 * Do not use in a production environment
 */
import cors from './cors';

export interface Address {
	port: number;
	family: string;
	address: string;
}

export class Application extends EventEmitter {
	private application: express.Application;
	private server: Server;

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

	public constructor() {
		super();

		this.application = express()
		.use(express.urlencoded({ extended: false }))
		.use(express.json())
		.use(cors({ hosts: ['http://localhost:4200'] }));
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
