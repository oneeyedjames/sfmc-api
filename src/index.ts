import * as dotenv from 'dotenv';
import { Router } from 'express';

import { Application, Address } from './app';
import { ApiClient, ApiClientConfig } from './api';
import authenticator from './auth';

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

app.use('/api', Router().use(authenticator, api.router))
.listen(process.env.HTTP_PORT)
.then((addr: Address) => {
	console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
.catch((error: Error) => {
	console.error(`Server Error: ${error.message || error}`);
});
