import { Router, Request, Response } from 'express';
import * as ET_Client from 'sfmc-fuelsdk-node';

import { SubscriberApi } from './api/subscriber';
import { ListApi } from './api/list';
import { SendApi, SendObject, ListSendObject } from './api/send';
import { EventApi, MultiEventApi } from './api/event';
import { DataExtApi } from './api/dataExt';
import { UserApi, UserObject } from './api/user';

import {
	formatSubscriber,
	formatSubscriberList,
	formatSubscriberEvent,
	handleError
} from './api-client';

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

	readonly lists: ListApi;

	readonly sends: SendApi;

	readonly events: MultiEventApi;

	readonly contacts: DataExtApi;
	readonly subscriptions: DataExtApi;

	readonly users: UserApi;

	constructor(config: ApiClientConfig) {
		this.client = new ET_Client(config.clientId, config.clientSecret, undefined, {
			authOrigin: `https://${config.subdomain}.auth.marketingcloudapis.com`,
			authOptions: { authVersion: 2, accountId: config.accountId }
		});

		this.router = Router()
		.get('/subscribers', (req: Request, resp: Response) => {
			const search = req.query.search as string;
			this.subscribers.get(search, 'SubscriberKey', 'EmailAddress')
			.then(res => res.map(formatSubscriber))
			.then(res => resp.json(res))
			.catch(handleError(resp));
		})

		.get('/subscriber/:subKey', (req: Request, resp: Response) => {
			this.subscribers.get(req.params.subKey, 'SubscriberKey')
			.then(res => this.getSubscriberLists(res))
			.then(res => this.getSubscriberEvents(res))
			.then(res => res.map(formatSubscriber))
			.then(res => res.length ? resp.json(res[0]) : resp.sendStatus(404))
			.catch(handleError(resp));
		})
		.put('/subscriber/:subKey', (req: Request, resp: Response) => {
			const props = {
				SubscriberKey: req.params.subKey,
				Status: req.body.Status
			};

			this.subscribers.put(props)
			.then(res => resp.json(res))
			.catch(handleError(resp));
		})

		.get('/subscriber/:subKey/lists', (req: Request, resp: Response) => {
			this.lists.getBySubscriber(req.params.subKey)
			.then(res => res.map(formatSubscriberList))
			.then(res => resp.json(res))
			.catch(handleError(resp));
		})
		.put('/subscriber/:subKey/lists', (req: Request, resp: Response) => {
			const props = {
				SubscriberKey: req.params.subKey,
				Lists: req.body.Lists
			};

			this.subscribers.put(props)
			.then(res => resp.json(res))
			.catch(handleError(resp));
		})

		.get('/subscriber/:subKey/events', (req: Request, resp: Response) => {
			const subKey = req.params.subKey as string;

			this.events.get(subKey)
			.then(res => this.getEventLists(res))
			.then(res => res.map(formatSubscriberEvent))
			.then(res => resp.json(res))
			.catch(handleError(resp));
		})

		.get('/contacts', (req: Request, resp: Response) => {
			const search = req.query.search as string;
			this.contacts.get(search, 'Id', 'Email')
			.then(res => resp.json(res))
			.catch(handleError(resp));
		})
		.get('/contact/:id', (req: Request, resp: Response) => {
			this.contacts.get(req.params.id, 'Id')
			.then(res => this.getContactSubscriptions(res))
			.then(res => res.length ? resp.json(res[0]) : resp.sendStatus(404))
			.catch(handleError(resp));
		})
		.get('/contact/:id/subscriptions', (req: Request, resp: Response) => {
			this.subscriptions.get(req.params.id, 'Contact__c')
			.then(res => resp.json(res))
			.catch(handleError(resp));
		});

		this.subscribers = new SubscriberApi(
			cfg => this.client.subscriber(cfg)
		);

		this.lists = new ListApi(
			cfg => this.client.list(cfg),
			cfg => this.client.listSubscriber(cfg)
		);

		this.sends = new SendApi(
			cfg => new SendObject(this.client, cfg),
			cfg => new ListSendObject(this.client, cfg)
		);

		const ttl = 90;

		this.events = new MultiEventApi([
			[cfg => this.client.sentEvent(cfg), [], ttl],
			[cfg => this.client.openEvent(cfg), [], ttl],
			[cfg => this.client.clickEvent(cfg), EventApi.ClickProps, ttl],
			[cfg => this.client.unsubEvent(cfg), EventApi.UnsubProps],
			[cfg => this.client.bounceEvent(cfg), EventApi.BounceProps]
		]);

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

		this.users = new UserApi(
			cfg => new UserObject(this.client, cfg)
		);
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
		const events = await this.events.get(subKeys);

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
}
