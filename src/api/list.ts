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

	async get(value?: string | string[], field = 'ID') {
		const lists = await super.get(value, field);
		lists.forEach(ListApi.populateListCode);
		return lists;
	}

	async getBySubscriber(value: string | string[], field = 'SubscriberKey') {
		const listSubs = await this.listSubApi.get(value, field);
		if (listSubs.length == 0) return listSubs;

		const listIds = Array.from(new Set<string>(listSubs.map(ls => ls.ListID)));
		const lists = await this.get(listIds);

		lists.forEach(list => {
			listSubs.filter(listSub => listSub.ListID == list.ID)
			.forEach(listSub => listSub.List = list);
		});

		return listSubs.filter(listSub => listSub.List &&
			listSub.List.ListClassification == 'PublicationList');
	}

	/**
	 * Parses the given list name for a product code. Publication lists are
	 * expected to follow this naming convention:
	 *
	 *   <Product Code> - <Product Description>
	 *
	 */
	static populateListCode(list: any) {
		const name = list.ListName as string;
		const keys = name.match(/^([^\s]+) - .+$/i);
		list.ListCode = keys ? keys[1] : undefined;
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
