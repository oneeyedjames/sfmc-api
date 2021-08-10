"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("./jwt");
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
exports.default = auth;
