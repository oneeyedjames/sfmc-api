"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const express_1 = require("express");
const ET_Client = require("sfmc-fuelsdk-node");
const subscriber_1 = require("./api/subscriber");
const list_1 = require("./api/list");
const send_1 = require("./api/send");
const event_1 = require("./api/event");
const dataExt_1 = require("./api/dataExt");
Array.prototype.unique = function () {
    return Array.from(new Set(this));
};
Array.prototype.mapUnique = function (fn) {
    return this.map(fn).unique();
};
class ApiClient {
    constructor(config) {
        this.client = new ET_Client(config.clientId, config.clientSecret, undefined, {
            authOrigin: `https://${config.subdomain}.auth.marketingcloudapis.com`,
            authOptions: { authVersion: 2, accountId: config.accountId }
        });
        this.router = express_1.Router()
            .get('/subscribers', (req, resp) => {
            const search = req.query.search;
            this.subscribers.get(search, 'SubscriberKey', 'EmailAddress')
                // .then(res => this.getUnsubscribes(res))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/subscriber/:subKey', (req, resp) => {
            this.subscribers.get(req.params.subKey, 'SubscriberKey')
                // .then(res => this.getUnsubscribes(res))
                .then(res => this.getSubscriberLists(res))
                .then(res => this.getSubscriberEvents(res))
                .then(res => res.map(this.formatSubscriber.bind(this)))
                .then(res => res.length ? resp.json(res[0]) : resp.sendStatus(404))
                .catch(this.handleError(resp));
        })
            .put('/subscriber/:subKey', (req, resp) => {
            const props = {
                SubscriberKey: req.params.subKey,
                Status: req.body.Status
            };
            this.subscribers.put(props)
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/subscriber/:subKey/lists', (req, resp) => {
            this.lists.getBySubscriber(req.params.subKey)
                .then(res => res.map(this.formatSubscriberList))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .put('/subscriber/:subKey/lists', (req, resp) => {
            const props = {
                SubscriberKey: req.params.subKey,
                Lists: req.body.Lists
            };
            this.subscribers.put(props)
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/subscriber/:subKey/events', (req, resp) => {
            const subKey = req.params.subKey;
            this.getEvents(subKey)
                .then(res => this.getEventLists(res))
                .then(res => res.map(this.formatSubscriberEvent))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/contacts', (req, resp) => {
            const search = req.query.search;
            this.contacts.get(search, 'Id', 'Email')
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/contact/:id', (req, resp) => {
            this.contacts.get(req.params.id, 'Id')
                .then(res => this.getContactSubscriptions(res))
                .then(res => res.length ? resp.json(res[0]) : resp.sendStatus(404))
                .catch(this.handleError(resp));
        })
            .get('/contact/:id/subscriptions', (req, resp) => {
            this.subscriptions.get(req.params.id, 'Contact__c')
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        });
        this.subscribers = new subscriber_1.SubscriberApi(cfg => this.client.subscriber(cfg));
        // this.unsubscribes = new DataExtApi(
        // 	cfg => this.client.dataExtensionRow(cfg),
        // 	DataExtApi.UnsubscribeType,
        // 	DataExtApi.UnsubscribeProps
        // );
        this.lists = new list_1.ListApi(cfg => this.client.list(cfg), cfg => this.client.listSubscriber(cfg));
        this.sends = new send_1.SendApi(cfg => new send_1.SendObject(this.client, cfg), cfg => new send_1.ListSendObject(this.client, cfg));
        this.bounceEvent = new event_1.EventApi(cfg => this.client.bounceEvent(cfg), event_1.EventApi.BounceProps);
        this.clickEvent = new event_1.EventApi(cfg => this.client.clickEvent(cfg), event_1.EventApi.ClickProps, 30);
        this.openEvent = new event_1.EventApi(cfg => this.client.openEvent(cfg), [], 30);
        this.sentEvent = new event_1.EventApi(cfg => this.client.sentEvent(cfg), [], 30);
        this.unsubEvent = new event_1.EventApi(cfg => this.client.unsubEvent(cfg), event_1.EventApi.UnsubProps);
        this.contacts = new dataExt_1.DataExtApi(cfg => this.client.dataExtensionRow(cfg), dataExt_1.DataExtApi.ContactType, dataExt_1.DataExtApi.ContactProps, dataExt_1.DataExtApi.ContactPropMap);
        this.subscriptions = new dataExt_1.DataExtApi(cfg => this.client.dataExtensionRow(cfg), dataExt_1.DataExtApi.SubscriptionType, dataExt_1.DataExtApi.SubscriptionProps, dataExt_1.DataExtApi.SubscriptionPropMap);
    }
    // private async getUnsubscribes(subs: any[]) {
    // 	if (subs.length == 0) return subs;
    //
    // 	const subKeys = subs.mapUnique<string>(sub => sub.SubscriberKey);
    // 	const unsubs = await this.unsubscribes.get(subKeys, 'SubscriberKey');
    //
    // 	unsubs.forEach(unsub => {
    // 		const subKey = unsub.SubscriberKey as string;
    // 		const sub = subs.find(sub => sub.SubscriberKey == subKey);
    //
    // 		if (sub !== undefined) {
    // 			sub.UnsubDate = unsub.UnsubDateUTC;
    // 			sub.UnsubReason = unsub.UnsubReason;
    // 		}
    // 	});
    //
    // 	return subs;
    // }
    async getSubscriberLists(subs) {
        if (subs.length == 0)
            return subs;
        subs.forEach(sub => sub.Lists = []);
        const subKeys = subs.mapUnique(sub => sub.SubscriberKey);
        const listSubs = await this.lists.getBySubscriber(subKeys);
        listSubs.forEach(listSub => {
            const subKey = listSub.SubscriberKey;
            const sub = subs.find(sub => sub.SubscriberKey == subKey);
            if (sub !== undefined)
                sub.Lists.push(listSub);
        });
        return subs;
    }
    async getSubscriberEvents(subs) {
        if (subs.length == 0)
            return subs;
        subs.forEach(sub => sub.Events = []);
        const subKeys = subs.mapUnique(sub => sub.SubscriberKey);
        const events = await this.getEvents(subKeys);
        if (events.length == 0)
            return subs;
        events.forEach(event => {
            const subKey = event.SubscriberKey;
            const sub = subs.find(sub => sub.SubscriberKey == subKey);
            if (sub !== undefined)
                sub.Events.push(event);
        });
        const sendIds = events.mapUnique(e => e.SendID);
        const sends = await this.sends.get(Array.from(sendIds));
        sends.forEach(send => {
            events.filter(event => event.SendID == send.ID)
                .forEach(event => event.Send = send);
        });
        return subs;
    }
    async getContactSubscriptions(cons) {
        if (cons.length == 0)
            return cons;
        cons.forEach(con => con.Subscriptions = []);
        const conIds = cons.mapUnique(con => con.Id);
        const subs = await this.subscriptions.get(conIds, 'Contact__c');
        subs.forEach(sub => {
            const con = cons.find(con => con.Id == sub.ContactId);
            if (con !== undefined)
                con.Subscriptions.push(sub);
        });
        return cons;
    }
    async getEventLists(events) {
        if (events.length == 0)
            return events;
        const sendIds = events.mapUnique(event => event.SendID);
        const sends = await this.sends.get(sendIds);
        sends.forEach(send => {
            events.filter(e => e.SendID == send.ID)
                .forEach(event => event.Send = send);
        });
        return events;
    }
    async getEvents(subKey) {
        if (subKey.length == 0)
            return [];
        return [].concat(...(await Promise.all([
            this.bounceEvent.get(subKey, 'SubscriberKey'),
            this.clickEvent.get(subKey, 'SubscriberKey'),
            this.openEvent.get(subKey, 'SubscriberKey'),
            this.sentEvent.get(subKey, 'SubscriberKey'),
            this.unsubEvent.get(subKey, 'SubscriberKey')
        ])));
    }
    formatSubscriber(sub) {
        sub.ObjectID = undefined;
        sub.PartnerKey = undefined;
        if (sub.Lists !== undefined)
            sub.Lists.forEach(this.formatSubscriberList);
        if (sub.Events !== undefined)
            sub.Events.forEach(this.formatSubscriberEvent);
        return sub;
    }
    formatSubscriberList(listSub) {
        listSub.ObjectID = undefined;
        listSub.PartnerKey = undefined;
        listSub.SubscriberKey = undefined;
        if (listSub.List !== undefined) {
            listSub.ListName = listSub.List.ListName;
            listSub.ListCode = listSub.List.ListCode;
            listSub.ListClassification = listSub.List.ListClassification;
            listSub.List = undefined;
        }
        if (listSub.PartnerProperties !== undefined) {
            listSub.UnsubscribedDate = listSub.PartnerProperties.Value;
            listSub.PartnerProperties = undefined;
        }
        return listSub;
    }
    formatSubscriberEvent(event) {
        event.ObjectID = undefined;
        event.PartnerKey = undefined;
        event.SubscriberKey = undefined;
        event.SendID = undefined;
        if (event.Send !== undefined) {
            event.ListID = event.Send.List.ID;
            event.ListName = event.Send.List.ListName;
            event.ListCode = event.Send.List.ListCode;
            event.EmailName = event.Send.EmailName;
            event.Send = undefined;
        }
        return event;
    }
    handleError(resp) {
        return (err) => {
            console.error(err);
            resp.status(500).json(err);
        };
    }
}
exports.ApiClient = ApiClient;
