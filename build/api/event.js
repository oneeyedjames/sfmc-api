"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventApi = void 0;
const object_1 = require("./object");
class EventApi extends object_1.ObjectApi {
    constructor(factory, props = []) {
        super(factory, [...EventApi.Props, ...props]);
    }
}
exports.EventApi = EventApi;
EventApi.Props = [
    'SendID',
    'EventDate',
    'EventType',
    'SubscriberKey'
];
EventApi.BounceProps = [
    'BounceCategory',
    'BounceType',
    'SMTPCode',
    'SMTPReason'
];
EventApi.ClickProps = [
    'URL'
];
EventApi.UnsubProps = [
    'IsMasterUnsubscribed'
];
