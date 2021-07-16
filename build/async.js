"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncToPromise = void 0;
function asyncToPromise(fn) {
    return () => new Promise((resolve, reject) => fn((err, res) => err ? reject(err) : resolve(res)));
}
exports.asyncToPromise = asyncToPromise;
