import { ApiObjectFactory } from './api';
import { ObjectApi,  } from './object';

export class EventApi extends ObjectApi {
	static readonly Props = [
		'SendID',
		'EventDate',
		'EventType',
		'SubscriberKey'
	];

	static readonly BounceProps = [
		'BounceCategory',
		'BounceType',
		'SMTPCode',
		'SMTPReason'
	];

	static readonly ClickProps = [
		'URL'
	];

	static readonly UnsubProps = [
		'IsMasterUnsubscribed'
	];

	constructor(factory: ApiObjectFactory, props: string[] = []) {
		super(factory, [...EventApi.Props, ...props]);
	}
}
