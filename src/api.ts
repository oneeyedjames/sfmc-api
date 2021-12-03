import { Router, Request, Response } from 'express';
import * as ET_Client from 'sfmc-fuelsdk-node';

import { SubscriberApi } from './api/subscriber';
import { ListApi } from './api/list';
import { SendApi, SendObject, ListSendObject } from './api/send';
import { EventApi } from './api/event';
import { DataExtApi } from './api/dataExt';

type MapFn<T, U> = {
	(value: T, index: number, array: T[]): U;
}

declare global {
	interface Array<T> {
		unique(): Array<T>;
		mapUnique<U>(fn: MapFn<T, U>): Array<U>;
	}
}

Array.prototype.unique = function<T>(this: Array<T>) {
	return Array.from(new Set<T>(this));
}

Array.prototype.mapUnique = function<T, U>(this: Array<T>, fn: MapFn<T, U>) {
	return this.map(fn).unique();
}

export type ApiClientConfig = {
	accountId: string;
	clientId: string;
	clientSecret: string;
	stack: string;
	subdomain: string;
}

export class ApiClient {
	private client: ET_Client;

	readonly router: Router;

	readonly subscribers: SubscriberApi;
	readonly unsubscribes: DataExtApi;

	readonly lists: ListApi;

	readonly sends: SendApi;

	readonly bounceEvent: EventApi;
	readonly clickEvent: EventApi;
	readonly openEvent: EventApi;
	readonly sentEvent: EventApi;
	readonly unsubEvent: EventApi;

	readonly contacts: DataExtApi;
	readonly subscriptions: DataExtApi;

	constructor(config: ApiClientConfig) {
		this.client = new ET_Client(config.clientId, config.clientSecret, undefined, {
			authOrigin: `https://${config.subdomain}.auth.marketingcloudapis.com`,
			authOptions: { authVersion: 2, accountId: config.accountId }
		});

		this.router = Router()
		.get('/subscribers', (req: Request, resp: Response) => {
			const [value, field] = this.getSearchParams(req);
			this.subscribers.get(value, field)
			.then(res => this.getUnsubscribes(res))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})

		.get('/subscriber/:subKey', (req: Request, resp: Response) => {
			this.subscribers.get(req.params.subKey, 'SubscriberKey')
			.then(res => this.getUnsubscribes(res))
			.then(res => this.getSubscriberLists(res))
			.then(res => this.getSubscriberEvents(res))
			.then(res => res.map(this.formatSubscriber.bind(this)))
			.then(res => res.length ? resp.json(res[0]) : resp.sendStatus(404))
			.catch(this.handleError(resp));
		})
		.put('/subscriber/:subKey', (req: Request, resp: Response) => {
			const props = {
				SubscriberKey: req.params.subKey,
				Status: req.body.Status
			};

			this.subscribers.put(props)
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})

		.get('/subscriber/:subKey/lists', (req: Request, resp: Response) => {
			this.lists.getBySubscriber(req.params.subKey)
			.then(res => res.map(this.formatSubscriberList))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})
		.put('/subscriber/:subKey/lists', (req: Request, resp: Response) => {
			const props = {
				SubscriberKey: req.params.subKey,
				Lists: req.body.Lists
			};

			this.subscribers.put(props)
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})

		.get('/subscriber/:subKey/events', (req: Request, resp: Response) => {
			const subKey = req.params.subKey as string;

			this.getEvents(subKey)
			.then(res => this.getEventLists(res))
			.then(res => res.map(this.formatSubscriberEvent))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})

		.get('/contacts', (req: Request, resp: Response) => {
			const [value, field] = this.getSearchParams(req, false);
			this.contacts.get(value, field)
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})
		.get('/contact/:id', (req: Request, resp: Response) => {
			this.contacts.get(req.params.id, 'Id')
			.then(res => this.getContactSubscriptions(res))
			.then(res => res.length ? resp.json(res[0]) : resp.sendStatus(404))
			.catch(this.handleError(resp));
		})
		.get('/contact/:id/subscriptions', (req: Request, resp: Response) => {
			this.subscriptions.get(req.params.id, 'Contact__c')
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		});

		this.subscribers = new SubscriberApi(cfg => this.client.subscriber(cfg));

		this.unsubscribes = new DataExtApi(
			cfg => this.client.dataExtensionRow(cfg),
			DataExtApi.UnsubscribeType,
			DataExtApi.UnsubscribeProps
		);

		this.lists = new ListApi(
			cfg => this.client.list(cfg),
			cfg => this.client.listSubscriber(cfg)
		);

		this.sends = new SendApi(
			cfg => new SendObject(this.client, cfg),
			cfg => new ListSendObject(this.client, cfg)
		);

		this.bounceEvent = new EventApi(cfg => this.client.bounceEvent(cfg),
			EventApi.BounceProps);

		this.clickEvent = new EventApi(cfg => this.client.clickEvent(cfg),
			EventApi.ClickProps, 30);

		this.openEvent = new EventApi(cfg => this.client.openEvent(cfg), [], 30);

		this.sentEvent = new EventApi(cfg => this.client.sentEvent(cfg), [], 30);

		this.unsubEvent = new EventApi(cfg => this.client.unsubEvent(cfg),
			EventApi.UnsubProps);

		this.contacts = new DataExtApi(
			cfg => this.client.dataExtensionRow(cfg),
			DataExtApi.ContactType,
			DataExtApi.ContactProps,
			DataExtApi.ContactPropMap
		);

		this.subscriptions = new DataExtApi(
			cfg => this.client.dataExtensionRow(cfg),
			DataExtApi.SubscriptionType,
			DataExtApi.SubscriptionProps,
			DataExtApi.SubscriptionPropMap
		);
	}

	private async getUnsubscribes(subs: any[]) {
		if (subs.length == 0) return subs;

		const subKeys = subs.mapUnique<string>(sub => sub.SubscriberKey);
		const unsubs = await this.unsubscribes.get(subKeys, 'SubscriberKey');

		unsubs.forEach(unsub => {
			const subKey = unsub.SubscriberKey as string;
			const sub = subs.find(sub => sub.SubscriberKey == subKey);

			if (sub !== undefined) {
				sub.UnsubDate = unsub.UnsubDateUTC;
				sub.UnsubReason = unsub.UnsubReason;
			}
		});

		return subs;
	}

	private async getSubscriberLists(subs: any[]) {
		if (subs.length == 0) return subs;

		subs.forEach(sub => sub.Lists = []);

		const subKeys = subs.mapUnique<string>(sub => sub.SubscriberKey);
		const listSubs = await this.lists.getBySubscriber(subKeys);

		listSubs.forEach(listSub => {
			const subKey = listSub.SubscriberKey as string;
			const sub = subs.find(sub => sub.SubscriberKey == subKey);

			if (sub !== undefined)
				sub.Lists.push(listSub);
		});

		return subs;
	}

	private async getSubscriberEvents(subs: any[]) {
		if (subs.length == 0) return subs;

		subs.forEach(sub => sub.Events = []);

		const subKeys = subs.mapUnique<string>(sub => sub.SubscriberKey);
		const events = await this.getEvents(subKeys);

		if (events.length == 0) return subs;

		events.forEach(event => {
			const subKey = event.SubscriberKey as string;
			const sub = subs.find(sub => sub.SubscriberKey == subKey);

			if (sub !== undefined)
				sub.Events.push(event);
		});

		const sendIds = events.mapUnique<string>(e => e.SendID);
		const sends = await this.sends.get(Array.from(sendIds));

		sends.forEach(send => {
			events.filter(event => event.SendID == send.ID)
			.forEach(event => event.Send = send);
		});

		return subs;
	}

	private async getContactSubscriptions(cons: any[]) {
		if (cons.length == 0) return cons;

		cons.forEach(con => con.Subscriptions = []);

		const conIds = cons.mapUnique<string>(con => con.Id);
		const subs = await this.subscriptions.get(conIds, 'Contact__c');

		subs.forEach(sub => {
			const con = cons.find(con => con.Id == sub.ContactId);

			if (con !== undefined)
				con.Subscriptions.push(sub);
		});

		return cons;
	}

	private async getEventLists(events: any[]) {
		if (events.length == 0) return events;

		const sendIds = events.mapUnique<string>(event => event.SendID);
		const sends = await this.sends.get(sendIds);

		sends.forEach(send => {
			events.filter(e => e.SendID == send.ID)
			.forEach(event => event.Send = send);
		});

		return events;
	}

	private async getEvents(subKey: string | string[]) {
		if (subKey.length == 0) return [];

		return [].concat(...(await Promise.all([
			this.bounceEvent.get(subKey, 'SubscriberKey'),
			this.clickEvent.get(subKey, 'SubscriberKey'),
			this.openEvent.get(subKey, 'SubscriberKey'),
			this.sentEvent.get(subKey, 'SubscriberKey'),
			this.unsubEvent.get(subKey, 'SubscriberKey')
		])));
	}

	private formatSubscriber(sub: any) {
		sub.ObjectID = undefined;
		sub.PartnerKey = undefined;

		if (sub.Lists !== undefined)
			sub.Lists.forEach(this.formatSubscriberList);

		if (sub.Events !== undefined)
			sub.Events.forEach(this.formatSubscriberEvent);

		return sub;
	}

	private formatSubscriberList(listSub: any) {
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

	private formatSubscriberEvent(event: any) {
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

	private getSearchParams(req: Request, mc = true): [string, string] {
		let value = req.query.key as string;
		let field = mc ? 'SubscriberKey' : 'Id';

		if (value === undefined) {
			value = req.query.email as string;
			field = mc ? 'EmailAddress' : 'Email';
		}

		return [value, field];
	}

	private handleError(resp: Response) {
		return (err: any) => {
			console.error(err);
			resp.status(500).json(err);
		}
	}
}
