"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthenticator = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = require("jsonwebtoken");
class JwtAuthenticator {
    constructor(provider) {
        this.provider = provider;
        this.router = express_1.Router().use((req, resp, next) => {
            if (req.method === 'OPTIONS')
                return next();
            const header = req.header('Authorization');
            if (header === undefined)
                return next();
            const [scheme, token] = header.split(' ', 2);
            if (scheme != 'JWT')
                return next();
            const jwt = JwtAuthenticator.decode(token);
            const clientId = Array.isArray(jwt.payload.aud)
                ? jwt.payload.aud[0] : jwt.payload.aud;
            this.provider.find(clientId)
                .then(client => JwtAuthenticator.verify(token, client.secret))
                .then(jwt => {
                req.jwt = jwt;
                next();
            })
                .catch(err => {
                resp.status(401).json({
                    error: 'invalid_token',
                    error_description: err.message
                });
            });
        });
    }
    static decode(token) {
        return jsonwebtoken_1.decode(token, { complete: true });
    }
    static verify(token, secret) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.verify(token, secret, { complete: true }, (err, jwt) => err ? reject(err) : resolve(jwt));
        });
    }
    async sign(audience, subjectOrClaims, claims) {
        let subject;
        if (subjectOrClaims === undefined) {
            subject = 'Anonymous';
        }
        else if (typeof subjectOrClaims === 'string') {
            subject = subjectOrClaims;
        }
        else {
            subject = 'Anonymous';
            claims = subjectOrClaims;
        }
        if (claims === undefined)
            claims = {};
        const client = await this.provider.find(audience);
        delete claims.iss;
        delete claims.sub;
        delete claims.aud;
        delete claims.exp;
        delete claims.nbf;
        delete claims.iat;
        const options = {
            issuer: this.provider.id,
            subject,
            audience,
            expiresIn: this.provider.ttl,
            notBefore: 0
        };
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.sign(claims, client.secret, options, (err, jwt) => err ? reject(err) : resolve(jwt));
        });
    }
}
exports.JwtAuthenticator = JwtAuthenticator;
