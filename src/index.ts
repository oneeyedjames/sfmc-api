import * as dotenv from 'dotenv';
import { Router, Request } from 'express';

import { Application, Address } from './app';
import { ApiClient, ApiClientConfig } from './api';
import { JwtAuthenticator } from './jwt';

dotenv.config();

const apiCfg: ApiClientConfig = {
	clientId: process.env.ET_CLIENT_ID,
	clientSecret: process.env.ET_CLIENT_SECRET,
	stack: process.env.ET_STACK,
	accountId: process.env.ET_ACCOUNT_ID,
	subdomain: process.env.ET_SUBDOMAIN
};

const app = new Application();
const api = new ApiClient(apiCfg);

const jwt = new JwtAuthenticator({
	id: 'SFMC',
	ttl: 86400,
	find: (id: string) => new Promise((resolve, reject) =>
		resolve({ id, secret: process.env.JWT_SECRET }))
});

const auth = Router().use(jwt.router, (req: Request, resp, next) => {
	if (req.method === 'OPTIONS')
		return next();

	if (req.jwt === undefined)
		return resp.sendStatus(401);

	next();
})

app.use('/api', Router().use(auth, api.router))
.listen(process.env.HTTP_PORT)
.then((addr: Address) => {
	console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
.catch((error: Error) => {
	console.error(`Server Error: ${error.message || error}`);
});
