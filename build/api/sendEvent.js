"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentEventApi = void 0;
const object_1 = require("./object");
class SentEventApi extends object_1.ObjectApi {
    constructor(client) {
        super(client);
        this.props = [
            'ID',
            'ListName',
            'ListClassification',
            'Description',
            'Type'
        ];
    }
    get(value, field = 'ID') {
        const opts = this.getOptions(value, field);
        return this.toPromise(this.client.sendEvent(opts));
    }
}
exports.SentEventApi = SentEventApi;
