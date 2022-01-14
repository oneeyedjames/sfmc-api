"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const express_1 = require("express");
const app_1 = require("./app");
const api_1 = require("./api");
/**
 * Middleware support for JWT authentication
 */
const auth_1 = require("./auth");
dotenv.config();
const apiCfg = {
    clientId: process.env.ET_CLIENT_ID,
    clientSecret: process.env.ET_CLIENT_SECRET,
    stack: process.env.ET_STACK,
    accountId: process.env.ET_ACCOUNT_ID,
    subdomain: process.env.ET_SUBDOMAIN
};
const ukCfg = { ...apiCfg, accountId: process.env.ET_UK_MID };
const usCfg = { ...apiCfg, accountId: process.env.ET_US_MID };
const app = new app_1.Application();
const api = new api_1.ApiClient(apiCfg);
const ukApi = new api_1.ApiClient(ukCfg);
const usApi = new api_1.ApiClient(usCfg);
app.use('/api', express_1.Router().use(auth_1.default, api.router))
    .use('/api/uk', express_1.Router().use(auth_1.default, ukApi.router))
    .use('/api/us', express_1.Router().use(auth_1.default, usApi.router))
    .listen(process.env.HTTP_PORT)
    .then((addr) => {
    console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
    .catch((error) => {
    console.error(`Server Error: ${error.message || error}`);
});
