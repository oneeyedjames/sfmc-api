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

	constructor(factory: ApiObjectFactory, props: string[] = [], private ttl?: number) {
		super(factory, [...EventApi.Props, ...props]);
	}

	/**
	 * Overrides default behavior to limit events to rolling month.
	 */
	protected getFilter(value?: string | string[], field = 'ID'): ApiObjectFilter {
		const parentFilter = super.getFilter(value, field);

		if (this.ttl === undefined) return parentFilter;

		const refDate = new Date();
		refDate.setDate(refDate.getDate() - this.ttl);

		return {
			operator: 'AND',
			leftOperand: parentFilter,
			rightOperand: {
				operator: 'greaterThan',
				leftOperand: 'EventDate',
				rightOperand: refDate.toISOString()
			}
		}
	}
}

export class MultiEventApi {
	protected eventApis: EventApi[];

	constructor(eventTypes: [ApiObjectFactory, string[]?, number?][]) {
		this.eventApis = eventTypes.map(type =>
			new EventApi(type[0], type[1] || [], type[2]));
	}

	async get(value?: string | string[], field = 'SubscriberKey', extra?: string) {
		const proms = this.eventApis.map(api => api.get(value, field, extra));
		return [].concat(...(await Promise.all(proms)));
	}
}
