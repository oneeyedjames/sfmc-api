import { ApiObjectFactory } from './api';
import { ObjectApi } from './object';

export class SubscriberApi extends ObjectApi {
	static readonly Props = [
		'SubscriberKey',
		'EmailAddress',
		'Status',
		'CreatedDate',
		'UnsubscribedDate'
	];

	constructor(factory: ApiObjectFactory) {
		super(factory, SubscriberApi.Props);
	}
}
