import * as dotenv from 'dotenv';
import { Router } from 'express';

import { Application, Address } from './app';
import { ApiClient, ApiClientConfig } from './api';

/**
 * Middleware support for JWT authentication
 */
import authenticator from './auth';

dotenv.config();

const apiCfg: ApiClientConfig = {
	clientId: process.env.ET_CLIENT_ID,
	clientSecret: process.env.ET_CLIENT_SECRET,
	stack: process.env.ET_STACK,
	accountId: process.env.ET_ACCOUNT_ID,
	subdomain: process.env.ET_SUBDOMAIN
};

const ukCfg: ApiClientConfig = { ...apiCfg, accountId: process.env.ET_UK_MID };
const usCfg: ApiClientConfig = { ...apiCfg, accountId: process.env.ET_US_MID };
const jpCfg: ApiClientConfig = { ...apiCfg, accountId: process.env.ET_JP_MID };

const app = new Application();
const api = new ApiClient(apiCfg);
const ukApi = new ApiClient(ukCfg);
const usApi = new ApiClient(usCfg);
const jpApi = new ApiClient(jpCfg);

app.use('/api', Router().use(authenticator, api.router))
.use('/api/uk', Router().use(authenticator, ukApi.router))
.use('/api/us', Router().use(authenticator, usApi.router))
.use('/api/jp', Router().use(authenticator, jpApi.router))
.listen(process.env.HTTP_PORT)
.then((addr: Address) => {
	console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
.catch((error: Error) => {
	console.error(`Server Error: ${error.message || error}`);
});
