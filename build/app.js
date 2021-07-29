"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const EventEmitter = require("events");
const express = require("express");
const jwt_1 = require("./jwt");
class Application extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.corsHosts = [
            'http://localhost:4200'
        ];
        this.jwt = new jwt_1.JwtAuthenticator({
            issuer: 'SFMC',
            secret: config.jwtSecret
        });
        this.application = express()
            .use(express.urlencoded({ extended: false }))
            .use(express.json())
            .use(cors(this.corsHosts))
            .use(this.jwt.authenticate)
            .use(auth);
    }
    get address() {
        if (!this.server)
            return null;
        let address = this.server.address();
        if (typeof address === 'string') {
            address = {
                port: 0,
                family: '',
                address: address
            };
        }
        return address;
    }
    use(urlPath, router, ...more) {
        if (typeof urlPath !== 'string') {
            router = urlPath;
            urlPath = '/';
        }
        this.application.use(urlPath, ...[router, ...more]);
        return this;
    }
    listen(port) {
        if (this.server && this.server.listening)
            return Promise.resolve(this.address);
        port = this.normalizePort(port) || 3000;
        this.application.set('port', port);
        this.emit('init');
        return new Promise((resolve, reject) => {
            this.server = this.application.listen(port, () => {
                resolve(this.address);
            }).on('error', (error) => reject(error));
        });
    }
    close() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    this.server = null;
                    resolve();
                });
            });
        }
        else {
            return Promise.reject(new Error('Server is already closed.'));
        }
    }
    normalizePort(val) {
        let port = (typeof val === 'string') ? parseInt(val, 10) : val;
        return isNaN(port) ? val : port;
    }
}
exports.Application = Application;
function auth(req, resp, next) {
    if (req.method === 'OPTIONS')
        return next();
    if (req.jwt === undefined)
        return resp.sendStatus(401);
    // this.jwt.sign(req.jwt.payload.aud, req.jwt.payload).then(jwt => {
    // 	console.log(jwt, this.jwt.decode(jwt));
    // 	next();
    // });
    next();
}
function cors(hosts) {
    return (req, resp, next) => {
        const origin = req.headers.origin;
        if (hosts.indexOf(origin) !== -1)
            resp.header('Access-Control-Allow-Origin', origin);
        resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
            .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
            .header('Access-Control-Allow-Credentials', 'true')
            .header('Access-Control-Expose-Headers', 'Set-Cookie');
        next();
    };
}
