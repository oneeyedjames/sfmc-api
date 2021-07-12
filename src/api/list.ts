import { ApiObjectFactory } from './api';
import { ObjectApi } from './object';

export class ListApi extends ObjectApi {
	static readonly Props = [
		'ID',
		'ListName',
		'ListClassification',
		'Description',
		'Type'
	];

	private listSubApi: ListSubscriberApi;

	constructor(factory: ApiObjectFactory, subFactory: ApiObjectFactory) {
		super(factory, ListApi.Props);

		this.listSubApi = new ListSubscriberApi(subFactory);
	}

	async getBySubscriber(value: string | string[], field = 'SubscriberKey') {
		const listSubs = await this.listSubApi.get(value, field);
		const listIds = Array.from(new Set<string>(listSubs.map(ls => ls.ListID)));
		const lists = await this.get(listIds);

		lists.forEach(list => {
			listSubs.filter(listSub => listSub.ListID == list.ID)
			.forEach(listSub => listSub.List = list);
		});

		return listSubs;
	}
}

export class ListSubscriberApi extends ObjectApi {
	static readonly Props = [
		'SubscriberKey',
		'Status',
		'ListID',
		'CreatedDate',
		'ModifiedDate',
		'UnsubscribedDate'
	];

	constructor(factory: ApiObjectFactory) {
		super(factory, ListSubscriberApi.Props);
	}
}
