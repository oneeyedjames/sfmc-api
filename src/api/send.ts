import { ApiClient, ApiObject, ApiObjectFactory, ApiObjectConfig } from './api';
import { ObjectApi } from './object';
import { ListApi } from './list';

export class SendApi extends ObjectApi {
	static readonly Props = [
		'ID',
		'SentDate',
		'EmailName'
	];

	private listSendApi: ListSendApi;

	constructor(factory: ApiObjectFactory, listFactory: ApiObjectFactory) {
		super(factory, SendApi.Props);

		this.listSendApi = new ListSendApi(listFactory);
	}

	async get(value?: string | string[], field = 'ID') {
		const sends = await super.get(value, field);
		if (sends.length == 0) return sends;

		const sendIds = Array.from(new Set<string>(sends.map(s => s.ID)));
		const listSends = await this.listSendApi.get(sendIds);

		listSends.forEach((listSend: any) => {
			const send = sends.find(send => send.ID == listSend.SendID);
			if (send !== undefined) send.List = listSend.List;
		});

		return sends;
	}
}

export class ListSendApi extends ObjectApi {
	static readonly Props = [
		'SendID',
		'List.ID',
		'List.ListName'
	];

	constructor(factory: ApiObjectFactory) {
		super(factory, ListSendApi.Props);
	}

	async get(value?: string | string[], field = 'SendID') {
		const listSends = await super.get(value, field);
		listSends.forEach(listSend => ListApi.populateListCode(listSend.List));
		return listSends;
	}
}

/**
 * Backfill for missing SOAP object in FuelSDK
 */
export class SendObject extends ApiObject {
	constructor(parent: ApiClient, config: ApiObjectConfig) {
		super('Send', parent, config);
	}
}

/**
 * Backfill for missing SOAP object in FuelSDK
 */
export class ListSendObject extends ApiObject {
	constructor(parent: ApiClient, config: ApiObjectConfig) {
		super('ListSend', parent, config);
	}
}
