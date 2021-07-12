import * as dotenv from 'dotenv';

import { Application, Address } from './app';
import { ApiClient } from './api';

dotenv.config();

const config = {
	clientId: process.env.ET_CLIENT_ID,
	clientSecret: process.env.ET_CLIENT_SECRET,
	stack: process.env.ET_STACK,
	accountId: process.env.ET_ACCOUNT_ID,
	subdomain: process.env.ET_SUBDOMAIN
};


const app = new Application();
const api = new ApiClient(config);

app.use('/api', api.router)
.listen(process.env.HTTP_PORT)
.then((addr: Address) => {
	console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
.catch((error: Error) => {
	console.error(`Server Error: ${error.message || error}`);
});
