"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const express_1 = require("express");
const app_1 = require("./app");
const api_1 = require("./api");
const jwt_1 = require("./jwt");
dotenv.config();
const apiCfg = {
    clientId: process.env.ET_CLIENT_ID,
    clientSecret: process.env.ET_CLIENT_SECRET,
    stack: process.env.ET_STACK,
    accountId: process.env.ET_ACCOUNT_ID,
    subdomain: process.env.ET_SUBDOMAIN
};
const app = new app_1.Application();
const api = new api_1.ApiClient(apiCfg);
const jwt = new jwt_1.JwtAuthenticator({
    id: 'SFMC',
    ttl: 86400,
    find: (id) => new Promise((resolve, reject) => resolve({ id, secret: process.env.JWT_SECRET }))
});
const auth = express_1.Router().use(jwt.router, (req, resp, next) => {
    if (req.method === 'OPTIONS')
        return next();
    if (req.jwt === undefined)
        return resp.sendStatus(401);
    next();
});
app.use('/api', express_1.Router().use(auth, api.router))
    .listen(process.env.HTTP_PORT)
    .then((addr) => {
    console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
    .catch((error) => {
    console.error(`Server Error: ${error.message || error}`);
});
