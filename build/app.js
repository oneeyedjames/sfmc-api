"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const EventEmitter = require("events");
const express = require("express");
const cors_1 = require("./cors");
class Application extends EventEmitter {
    constructor() {
        super();
        this.application = express()
            .use(express.urlencoded({ extended: false }))
            .use(express.json())
            .use(cors_1.default({ hosts: ['http://localhost:4200'] }));
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
