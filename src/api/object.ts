import { asyncToPromise } from '../async';

import {
	ApiObject,
	ApiObjectFactory,
	ApiObjectConfig,
	ApiObjectFilter,
	ApiObjectProps
} from './api';

export class ObjectApi {
	private prevRequestID?: string;

	public get hasMore() { return this.prevRequestID !== undefined; }

	constructor(
		protected getObject: ApiObjectFactory,
		protected props: ApiObjectProps = []
	) {}

	get(value?: string | string[], field = 'ID', extra?: string) {
		if (this.getObject !== undefined) {
			const config = this.getConfig(value, field, extra);
			return this.getPromise(this.getObject(config));
		} else {
			return Promise.reject('No API Object');
		}
	}

	getMore() {
		if (this.getObject === undefined)
			return Promise.reject('No API Object');

		if (this.prevRequestID === undefined)
			return Promise.reject('No Previous Request');

		const config = {
			props: this.props,
			continueRequest: this.prevRequestID
		} as ApiObjectConfig;

		return this.getPromise(this.getObject(config));
	}

	put(props: ApiObjectProps) {
		if (this.getObject !== undefined) {
			const config = this.getConfig();
			config.props = props;
			return this.putPromise(this.getObject(config));
		} else {
			return Promise.reject('No API Object');
		}
	}

	protected async getPromise<T = any>(obj: ApiObject) {
		const res = await asyncToPromise(obj.get.bind(obj))();

		if (res.body.OverallStatus == 'OK') {
			this.prevRequestID = undefined;
			return res.body.Results as T[];
		} else if (res.body.OverallStatus == 'MoreDataAvailable') {
			this.prevRequestID = res.body.RequestID;
			return res.body.Results as T[];
		} else {
			throw new Error(res.error || res);
		}
	}

	protected async putPromise<T = any>(obj: ApiObject) {
		const res = await asyncToPromise(obj.patch.bind(obj))();

		if (res.body.OverallStatus == 'OK') {
			return res.body.Results as T;
		} else {
			throw new Error(res.error || res);
		}
	}

	protected getConfig(value?: string | string[], field = 'ID', extra?: string): ApiObjectConfig {
		const config = { props: this.props } as ApiObjectConfig;

		if (value !== undefined && field !== undefined)
			config.filter = this.getFilter(value, field, extra);

		// console.log(value, field, extra, config.filter);

		return config;
	}

	protected getFilter(value?: string | string[], field = 'ID', extra?: string): ApiObjectFilter {
		if (Array.isArray(value)) {
			if (value.length == 1) {
				value = value[0];
			} else if (value.length == 0) {
				throw new Error('Filter array cannot be empty');
			}
		}

		const filter = {
			operator: Array.isArray(value) ? 'IN' : 'equals',
			leftOperand: field,
			rightOperand: value
		} as ApiObjectFilter;

		if (extra === undefined) return filter;

		return {
			operator: 'OR',
			leftOperand: { ...filter },
			rightOperand: { ...filter, leftOperand: extra }
		}
	}
}
