"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = (cfg) => {
    const hosts = cfg.hosts || [];
    const methods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        ...(cfg.methods || [])
    ];
    const headers = [
        'Origin',
        'Accept',
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        ...(cfg.headers || [])
    ];
    return (req, resp, next) => {
        const origin = req.headers.origin;
        if (hosts.indexOf(origin) !== -1)
            resp.header('Access-Control-Allow-Origin', origin);
        resp.header('Access-Control-Allow-Credentials', 'true')
            .header('Access-Control-Allow-Methods', methods.join(', '))
            .header('Access-Control-Allow-Headers', headers.join(', '))
            .header('Access-Control-Expose-Headers', 'Set-Cookie');
        next();
    };
};
exports.default = cors;
