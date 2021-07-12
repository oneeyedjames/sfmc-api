"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const EventEmitter = require("events");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
class Application extends EventEmitter {
    constructor() {
        super();
        this.corsHosts = [
            'http://localhost:4200'
        ];
        this.application = express()
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({ extended: false }))
            .use(cookieParser())
            .use(this.cors.bind(this));
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
    cors(req, resp, next) {
        let origin = req.headers.origin;
        if (this.corsHosts.indexOf(origin) !== -1) {
            resp.header('Access-Control-Allow-Origin', origin);
        }
        resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
            .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            .header('Access-Control-Allow-Credentials', 'true')
            .header('Access-Control-Expose-Headers', 'Set-Cookie');
        next();
    }
}
exports.Application = Application;
