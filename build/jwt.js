"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthenticator = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
class JwtAuthenticator {
    constructor(config) {
        this.config = config;
        this.authenticate = (req, resp, next) => {
            const header = req.header('Authorization');
            if (header === undefined)
                next();
            const [scheme, token] = header.split(' ', 2);
            if (scheme != 'JWT')
                return next();
            this.verify(token)
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
        };
        this.ttl = 3600;
    }
    decode(token) {
        return jsonwebtoken_1.decode(token, { complete: true });
    }
    verify(token) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.verify(token, this.config.secret, { complete: true }, (err, jwt) => err ? reject(err) : resolve(jwt));
        });
    }
    sign(audience, subjectOrClaims, claims) {
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
        delete claims.iss;
        delete claims.sub;
        delete claims.aud;
        delete claims.exp;
        delete claims.nbf;
        delete claims.iat;
        const options = {
            issuer: this.config.issuer,
            subject,
            audience,
            expiresIn: this.ttl,
            notBefore: 0
        };
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.sign(claims, this.config.secret, options, (err, jwt) => err ? reject(err) : resolve(jwt));
        });
    }
}
exports.JwtAuthenticator = JwtAuthenticator;
