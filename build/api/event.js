"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventApi = void 0;
const object_1 = require("./object");
class EventApi extends object_1.ObjectApi {
    constructor(factory, props = []) {
        super(factory, [...EventApi.Props, ...props]);
    }
    /**
     * Overrides default behavior to limit events to rolling month.
     */
    getFilter(value, field = 'ID') {
        const refDate = new Date();
        refDate.setDate(refDate.getDate() - 30);
        return {
            operator: 'AND',
            leftOperand: super.getFilter(value, field),
            rightOperand: {
                operator: 'greaterThan',
                leftOperand: 'EventDate',
                rightOperand: refDate.toISOString()
            }
        };
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
