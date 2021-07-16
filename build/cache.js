"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor(ttl = 300000) {
        this.ttl = ttl;
        this.cache = {};
    }
    get(key) {
        if (this.isset(key)) {
            const { payload, expires } = this.cache[key];
            return { payload: JSON.parse(payload), expires };
        }
        return undefined;
    }
    set(key, obj, ttl) {
        this.unset(key);
        if (ttl === undefined)
            ttl = this.ttl;
        this.cache[key] = {
            payload: JSON.stringify(obj),
            expires: Date.now() + ttl,
            timeout: setTimeout(() => delete this.cache[key], ttl)
        };
    }
    isset(key) {
        return this.cache[key] !== undefined;
    }
    unset(key) {
        if (this.isset(key)) {
            const { timeout } = this.cache[key];
            clearTimeout(timeout);
            delete this.cache[key];
        }
    }
}
exports.Cache = Cache;
