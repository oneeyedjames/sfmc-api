"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiEventApi = exports.EventApi = void 0;
const object_1 = require("./object");
class EventApi extends object_1.ObjectApi {
    constructor(factory, props = [], ttl) {
        super(factory, [...EventApi.Props, ...props]);
        this.ttl = ttl;
    }
    /**
     * Overrides default behavior to limit events to rolling month.
     */
    getFilter(value, field = 'ID') {
        const parentFilter = super.getFilter(value, field);
        if (this.ttl === undefined)
            return parentFilter;
        const refDate = new Date();
        refDate.setDate(refDate.getDate() - this.ttl);
        return {
            operator: 'AND',
            leftOperand: parentFilter,
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
class MultiEventApi {
    constructor(eventTypes) {
        this.eventApis = eventTypes.map(type => new EventApi(type[0], type[1] || [], type[2]));
    }
    async get(value, field = 'SubscriberKey', extra) {
        const proms = this.eventApis.map(api => api.get(value, field, extra));
        return [].concat(...(await Promise.all(proms)));
    }
}
exports.MultiEventApi = MultiEventApi;
