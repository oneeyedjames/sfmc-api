import { ApiClient, ApiObject, ApiObjectFactory, ApiObjectConfig } from './api';
import { ObjectApi } from './object';

export class BusinessUnitApi extends ObjectApi {
	static readonly Props = [
		'ID',
		'Name',
		'City',
		'Country',
		'TimeZone',
		'LanguageLocale',
		'Locale',
		'CreatedDate',
		'ModifiedDate'
	];

	constructor(factory: ApiObjectFactory) {
		super(factory, BusinessUnitApi.Props);
	}
}

/**
 * Backfill for missing SOAP object in FuelSDK
 */
export class BusinessUnitObject extends ApiObject {
	constructor(parent: ApiClient, config: ApiObjectConfig) {
		super('BusinessUnit', parent, config);
	}
}
