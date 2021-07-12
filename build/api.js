"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const express_1 = require("express");
const ET_Client = require("sfmc-fuelsdk-node");
// import { ObjectApi } from './api/object';
const subscriber_1 = require("./api/subscriber");
const list_1 = require("./api/list");
const send_1 = require("./api/send");
const event_1 = require("./api/event");
const dataExt_1 = require("./api/dataExt");
class ApiClient {
    constructor(config) {
        this.client = new ET_Client(config.clientId, config.clientSecret, undefined, {
            authOrigin: `https://${config.subdomain}.auth.marketingcloudapis.com`,
            authOptions: { authVersion: 2, accountId: config.accountId }
        });
        this.router = express_1.Router()
            .get('/subscriber/lists', (req, resp) => {
            this.subscribers.get(req.query.email, 'EmailAddress')
                .then(res => this.getSubscriberData(res))
                .then(res => this.getSubscriberLists(res))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/subscriber/events', (req, resp) => {
            this.subscribers.get(req.query.email, 'EmailAddress')
                .then(res => this.getSubscriberData(res))
                .then(res => this.getSubscriberEvents(res))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/subscriber/complete', (req, resp) => {
            this.subscribers.get(req.query.email, 'EmailAddress')
                .then(res => this.getSubscriberData(res))
                .then(res => this.getSubscriberLists(res))
                .then(res => this.getSubscriberEvents(res))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        })
            .get('/subscriber', (req, resp) => {
            this.subscribers.get(req.query.email, 'EmailAddress')
                .then(res => this.getSubscriberData(res))
                .then(res => resp.json(res))
                .catch(this.handleError(resp));
        });
        this.subscribers = new subscriber_1.SubscriberApi(cfg => this.client.subscriber(cfg));
        this.lists = new list_1.ListApi(cfg => this.client.list(cfg), cfg => this.client.listSubscriber(cfg));
        this.sends = new send_1.SendApi(cfg => new send_1.SendObject(this.client, cfg), cfg => new send_1.ListSendObject(this.client, cfg));
        this.bounceEvent = new event_1.EventApi(cfg => this.client.bounceEvent(cfg), event_1.EventApi.BounceProps);
        this.clickEvent = new event_1.EventApi(cfg => this.client.clickEvent(cfg), event_1.EventApi.ClickProps);
        this.openEvent = new event_1.EventApi(cfg => this.client.openEvent(cfg));
        this.sentEvent = new event_1.EventApi(cfg => this.client.sentEvent(cfg));
        this.unsubEvent = new event_1.EventApi(cfg => this.client.unsubEvent(cfg), event_1.EventApi.UnsubProps);
        this.contacts = new dataExt_1.DataExtApi(cfg => this.client.dataExtensionRow(cfg), dataExt_1.DataExtApi.ContactType, dataExt_1.DataExtApi.ContactProps);
        this.subscriptions = new dataExt_1.DataExtApi(cfg => this.client.dataExtensionRow(cfg), dataExt_1.DataExtApi.SubscriptionType, dataExt_1.DataExtApi.SubscriptionProps);
    }
    getSubscriberData(subs) {
        return __awaiter(this, void 0, void 0, function* () {
            // const subKeys = this.getUniqueSet(subs, sub => sub.SubscriberKey);
            //
            // const cons = await this.contacts.get(subKeys);
            //
            // cons.forEach(con => {
            // 	const sub = subs.find(sub => sub.SubscriberKey == con.Id);
            // 	if (sub != undefined) sub.Data = con;
            // });
            return subs;
        });
    }
    getSubscriberLists(subs) {
        return __awaiter(this, void 0, void 0, function* () {
            const subKeys = this.getUniqueSet(subs, sub => sub.SubscriberKey);
            const lists = yield this.lists.getBySubscriber(subKeys);
            lists.forEach(listSub => {
                if (listSub.List.ListClassification == 'PublicationList') {
                    const name = listSub.List.ListName;
                    const keys = name.match(/^(.+) - .+$/i);
                    listSub.List.ProductCode = keys ? keys[1] : undefined;
                }
                const subKey = listSub.SubscriberKey;
                const sub = subs.find(sub => sub.SubscriberKey == subKey);
                if (sub != undefined) {
                    sub.Lists = sub.Lists || [];
                    sub.Lists.push({
                        ListID: listSub.ListID,
                        ListName: listSub.List.ListName,
                        ListCode: listSub.List.ProductCode,
                        ListClassification: listSub.List.ListClassification,
                        Status: listSub.Status,
                        CreatedDate: listSub.CreatedDate,
                        ModifiedDate: listSub.ModifiedDate,
                        UnsubscribedDate: listSub.PartnerProperties.Value
                    });
                }
            });
            // const scripts = await this.subscriptions.get(subKeys, 'Contact__c');
            //
            // subs.forEach(sub => sub.Lists.forEach((subList: any) => {
            // 	if (subList.ListCode !== undefined) {
            // 		const script = scripts.find(s => s.GlobalProductCode == subList.ListCode);
            // 		if (script !== undefined) subList.Data = script;
            // 	}
            // }));
            return subs;
        });
    }
    getSubscriberEvents(subs) {
        return __awaiter(this, void 0, void 0, function* () {
            const subKeys = this.getUniqueSet(subs, sub => sub.SubscriberKey);
            const allEvents = [].concat(...(yield Promise.all([
                this.bounceEvent.get(subKeys, 'SubscriberKey'),
                this.clickEvent.get(subKeys, 'SubscriberKey'),
                this.openEvent.get(subKeys, 'SubscriberKey'),
                this.sentEvent.get(subKeys, 'SubscriberKey'),
                this.unsubEvent.get(subKeys, 'SubscriberKey')
            ])));
            if (allEvents.length == 0) {
                subs.forEach(sub => sub.Events = []);
                return subs;
            }
            const sendIds = new Set();
            allEvents.forEach(event => {
                const subKey = event.SubscriberKey;
                const sub = subs.find(sub => sub.SubscriberKey == subKey);
                event.ObjectID = undefined;
                event.PartnerKey = undefined;
                event.SubscriberKey = undefined;
                if (sub != undefined) {
                    sub.Events = sub.Events || [];
                    sub.Events.push(event);
                }
                sendIds.add(event.SendID);
            });
            const allSends = yield this.sends.get(Array.from(sendIds));
            allSends.forEach(send => {
                const events = allEvents.filter(event => event.SendID == send.ID);
                events.forEach(event => {
                    event.ListID = send.List.ID;
                    event.ListName = send.List.ListName;
                    event.EmailName = send.EmailName;
                });
            });
            return subs;
        });
    }
    getUniqueSet(items, cb) {
        return Array.from(new Set(items.map(cb)));
    }
    handleError(resp) {
        return (err) => {
            console.error(err);
            resp.status(500).json(err);
        };
    }
}
exports.ApiClient = ApiClient;
