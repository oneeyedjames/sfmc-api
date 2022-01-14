"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
function handleError(resp) {
    return (err) => {
        console.error(err);
        resp.status(500).json(err);
    };
}
exports.handleError = handleError;
