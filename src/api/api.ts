import * as ApiClient from 'sfmc-fuelsdk-node';
export { ApiClient };

import { AsyncObject, AsyncCallback } from '../async';

export type ApiObjectProps = string[] | { [key: string]: any };

export type ApiObjectConfig = {
	props?: ApiObjectProps;
	filter?: ApiObjectFilter;
	options?: any;
}

export type ApiObjectFilter = {
	operator: string;
	leftOperand: string | string[] | ApiObjectFilter;
	rightOperand: string | string[] | ApiObjectFilter;
}

export type ApiObjectFactory = {
	(config: ApiObjectConfig): ApiObject;
}

/**
 * Backfill for missing SOAP objects in FuelSDK
 */
export class ApiObject implements AsyncObject {
	props: ApiObjectProps;
	options: any;

	constructor(
		public objName: string,
		public parent: ApiClient,
		public config: ApiObjectConfig
	) {
		this.props = config.props || {};
		this.options = config.options || {};
	}

	get(cb: AsyncCallback) {
		var filter = this.config.filter ? { filter: this.config.filter } : null;

		if (this.props.length == 0) {
			cb({ error: `A property list is required for ${this.objName} retrieval.` });
		} else {
			this.parent.SoapClient.retrieve(
				this.objName,
				this.props,
				filter,
				cb
			);
		}
	}

	post(cb: AsyncCallback) {
		this.parent.SoapClient.create(
			this.objName,
			this.props,
			this.options,
			cb
		);
	}

	patch(cb: AsyncCallback) {
		this.parent.SoapClient.update(
			this.objName,
			this.props,
			this.options,
			cb
		);
	}

	delete(cb: AsyncCallback) {
		this.parent.SoapClient.delete(
			this.objName,
			this.props,
			this.options,
			cb
		);
	}
}
