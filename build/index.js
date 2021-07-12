"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const app_1 = require("./app");
const api_1 = require("./api");
dotenv.config();
const config = {
    clientId: process.env.ET_CLIENT_ID,
    clientSecret: process.env.ET_CLIENT_SECRET,
    stack: process.env.ET_STACK,
    accountId: process.env.ET_ACCOUNT_ID,
    subdomain: process.env.ET_SUBDOMAIN
};
const app = new app_1.Application();
const api = new api_1.ApiClient(config);
app.use('/api', api.router)
    .listen(process.env.HTTP_PORT)
    .then((addr) => {
    console.log(`Server listening on ${addr.address}:${addr.port} ...`);
})
    .catch((error) => {
    console.error(`Server Error: ${error.message || error}`);
});
