import { ApiClient, ApiObject, ApiObjectFactory, ApiObjectConfig } from './api';
import { ObjectApi } from './object';

export class UserApi extends ObjectApi {
	static readonly Props = [
		'ID',
		'Name',
		'Email',
		'Roles',
		'ActiveFlag',
		'CustomerKey'
	];

	constructor(factory: ApiObjectFactory) {
		super(factory, UserApi.Props);
	}
}

/**
 * Backfill for missing SOAP object in FuelSDK
 */
export class UserObject extends ApiObject {
	constructor(parent: ApiClient, config: ApiObjectConfig) {
		super('AccountUser', parent, config);
	}
}
