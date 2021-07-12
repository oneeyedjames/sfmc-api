"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberApi = void 0;
const object_1 = require("./object");
class SubscriberApi extends object_1.ObjectApi {
    constructor(factory) {
        super(factory, SubscriberApi.Props);
    }
}
exports.SubscriberApi = SubscriberApi;
SubscriberApi.Props = [
    'SubscriberKey',
    'EmailAddress',
    'Status',
    'CreatedDate',
    'UnsubscribedDate'
];
