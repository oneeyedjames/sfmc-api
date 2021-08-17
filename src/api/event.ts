import { ApiObjectFactory, ApiObjectFilter } from './api';
import { ObjectApi } from './object';

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

	protected getFilter(value?: string | string[], field = 'ID'): ApiObjectFilter {
		const refDate = new Date();
		refDate.setDate(refDate.getDate() - 30);

		return {
			operator: 'AND',
			leftOperand: super.getFilter(value, field),
			rightOperand: {
				operator: 'greaterThan',
				leftOperand: 'EventDate',
				rightOperand: refDate.toISOString()
			}
		}
	}
}
