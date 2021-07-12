import { Router, Request, Response } from 'express';
import * as ET_Client from 'sfmc-fuelsdk-node';

// import { ObjectApi } from './api/object';
import { SubscriberApi } from './api/subscriber';
import { ListApi } from './api/list';
import { SendApi, SendObject, ListSendObject } from './api/send';
import { EventApi } from './api/event';

import { DataExtApi } from './api/dataExt';

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
	// readonly listSubscribers: ListSubscriberApi;

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
		.get('/subscriber/lists', (req: Request, resp: Response) => {
			this.subscribers.get(req.query.email as string, 'EmailAddress')
			.then(res => this.getSubscriberData(res))
			.then(res => this.getSubscriberLists(res))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})
		.get('/subscriber/events', (req: Request, resp: Response) => {
			this.subscribers.get(req.query.email as string, 'EmailAddress')
			.then(res => this.getSubscriberData(res))
			.then(res => this.getSubscriberEvents(res))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})
		.get('/subscriber/complete', (req: Request, resp: Response) => {
			this.subscribers.get(req.query.email as string, 'EmailAddress')
			.then(res => this.getSubscriberData(res))
			.then(res => this.getSubscriberLists(res))
			.then(res => this.getSubscriberEvents(res))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		})
		.get('/subscriber', (req: Request, resp: Response) => {
			this.subscribers.get(req.query.email as string, 'EmailAddress')
			.then(res => this.getSubscriberData(res))
			.then(res => resp.json(res))
			.catch(this.handleError(resp));
		});

		this.subscribers = new SubscriberApi(cfg => this.client.subscriber(cfg));

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
			EventApi.ClickProps);

		this.openEvent = new EventApi(cfg => this.client.openEvent(cfg));

		this.sentEvent = new EventApi(cfg => this.client.sentEvent(cfg));

		this.unsubEvent = new EventApi(cfg => this.client.unsubEvent(cfg),
			EventApi.UnsubProps);

		this.contacts = new DataExtApi(cfg => this.client.dataExtensionRow(cfg),
			DataExtApi.ContactType, DataExtApi.ContactProps);

		this.subscriptions = new DataExtApi(cfg => this.client.dataExtensionRow(cfg),
			DataExtApi.SubscriptionType, DataExtApi.SubscriptionProps);
	}

	private async getSubscriberData(subs: any[]) {
		// const subKeys = this.getUniqueSet(subs, sub => sub.SubscriberKey);
		//
		// const cons = await this.contacts.get(subKeys);
		//
		// cons.forEach(con => {
		// 	const sub = subs.find(sub => sub.SubscriberKey == con.Id);
		// 	if (sub != undefined) sub.Data = con;
		// });

		return subs;
	}

	private async getSubscriberLists(subs: any[]) {
		const subKeys = this.getUniqueSet(subs, sub => sub.SubscriberKey);

		const lists = await this.lists.getBySubscriber(subKeys);

		lists.forEach(listSub => {
			if (listSub.List.ListClassification == 'PublicationList') {
				const name = listSub.List.ListName as string;
				const keys = name.match(/^(.+) - .+$/i);
				listSub.List.ProductCode = keys ? keys[1] : undefined;
			}

			const subKey = listSub.SubscriberKey as string;
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
	}

	private async getSubscriberEvents(subs: any[]) {
		const subKeys = this.getUniqueSet(subs, sub => sub.SubscriberKey as string);

		const allEvents = [].concat(...(await Promise.all([
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

		const sendIds = new Set<string>();

		allEvents.forEach(event => {
			const subKey = event.SubscriberKey as string;
			const sub = subs.find(sub => sub.SubscriberKey == subKey);

			event.ObjectID = undefined;
			event.PartnerKey = undefined;
			event.SubscriberKey = undefined;

			if (sub != undefined) {
				sub.Events = sub.Events || [];
				sub.Events.push(event);
			}

			sendIds.add(event.SendID as string);
		});

		const allSends = await this.sends.get(Array.from(sendIds));

		allSends.forEach(send => {
			const events = allEvents.filter(event => event.SendID == send.ID);

			events.forEach(event => {
				event.ListID = send.List.ID;
				event.ListName = send.List.ListName;
				event.EmailName = send.EmailName;
			});
		});

		return subs;
	}

	private getUniqueSet<T, V>(items: T[], cb: (item: T) => V) {
		return Array.from(new Set<V>(items.map(cb)));
	}

	private handleError(resp: Response) {
		return (err: any) => {
			console.error(err);
			resp.status(500).json(err);
		}
	}
}
