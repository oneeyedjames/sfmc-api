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

const locCfg = {
	US: { ...apiCfg, accountId: process.env.ET_US_MID },
	SG: { ...apiCfg, accountId: process.env.ET_SG_MID },
	UK: { ...apiCfg, accountId: process.env.ET_UK_MID },
	IE: { ...apiCfg, accountId: process.env.ET_IE_MID },
	DE: { ...apiCfg, accountId: process.env.ET_DE_MID },
	BY: { ...apiCfg, accountId: process.env.ET_BY_MID },
	KE: { ...apiCfg, accountId: process.env.ET_KE_MID },
	UA: { ...apiCfg, accountId: process.env.ET_UA_MID },
	NG: { ...apiCfg, accountId: process.env.ET_NG_MID },
	RU: { ...apiCfg, accountId: process.env.ET_RU_MID },
	ZA: { ...apiCfg, accountId: process.env.ET_ZA_MID },
	GY: { ...apiCfg, accountId: process.env.ET_GY_MID },
	AR: { ...apiCfg, accountId: process.env.ET_AR_MID },
	CO: { ...apiCfg, accountId: process.env.ET_CO_MID },
	MX: { ...apiCfg, accountId: process.env.ET_MX_MID },
	PE: { ...apiCfg, accountId: process.env.ET_PE_MID },
	BR: { ...apiCfg, accountId: process.env.ET_BR_MID },
	NZ: { ...apiCfg, accountId: process.env.ET_NZ_MID },
	JM: { ...apiCfg, accountId: process.env.ET_JM_MID },
	TT: { ...apiCfg, accountId: process.env.ET_TT_MID },
	HK: { ...apiCfg, accountId: process.env.ET_HK_MID },
	ES: { ...apiCfg, accountId: process.env.ET_ES_MID },
	JP: { ...apiCfg, accountId: process.env.ET_JP_MID },
	PT: { ...apiCfg, accountId: process.env.ET_PT_MID },
	TW: { ...apiCfg, accountId: process.env.ET_TW_MID },
	LK: { ...apiCfg, accountId: process.env.ET_LK_MID },
	KH: { ...apiCfg, accountId: process.env.ET_KH_MID },
	MY: { ...apiCfg, accountId: process.env.ET_MY_MID },
	MM: { ...apiCfg, accountId: process.env.ET_MM_MID },
	VN: { ...apiCfg, accountId: process.env.ET_VN_MID },
	ID: { ...apiCfg, accountId: process.env.ET_ID_MID },
	PH: { ...apiCfg, accountId: process.env.ET_PH_MID },
	TH: { ...apiCfg, accountId: process.env.ET_TH_MID },
	CA: { ...apiCfg, accountId: process.env.ET_CA_MID },
	IN: { ...apiCfg, accountId: process.env.ET_IN_MID },
	CN: { ...apiCfg, accountId: process.env.ET_CN_MID }
};

const app = new Application();
const api = new ApiClient(apiCfg);

// const usApi = new ApiClient(locCfg.US);
// const ukApi = new ApiClient(locCfg.UK);
// const jpApi = new ApiClient(locCfg.JP);

app.use('/api', Router().use(authenticator, api.router));

// .use('/api/us', Router().use(authenticator, usApi.router))
// .use('/api/uk', Router().use(authenticator, ukApi.router))
// .use('/api/jp', Router().use(authenticator, jpApi.router))

Object.entries(locCfg).forEach(([key, cfg]) => {
	const path = `/api/${key.toLowerCase()}`;
	const api = new ApiClient(cfg);

	app.use(path, Router().use(authenticator, api.router));
});

app.listen(process.env.HTTP_PORT)
.then((addr: Address) => {
	console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
.catch((error: Error) => {
	console.error(`Server Error: ${error.message || error}`);
});
