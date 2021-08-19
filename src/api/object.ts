import { asyncToPromise } from '../async';
// import { Cache } from '../cache'

import {
	ApiObject,
	ApiObjectFactory,
	ApiObjectConfig,
	ApiObjectFilter,
	ApiObjectProps
} from './api';

export class ObjectApi {
	// Suppress caching until a better scheme can be implemented
	// private cache = new Cache();

	constructor(
		protected getObject: ApiObjectFactory,
		protected props: ApiObjectProps = []
	) {}

	get(value?: string | string[], field = 'ID') {
		if (this.getObject !== undefined) {
			const config = this.getConfig(value, field);
			return this.getPromise(this.getObject(config));
		} else {
			return Promise.reject('No API Object');
		}
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
		// const key = JSON.stringify(obj.config);
		// if (this.cache.isset(key))
		// 	return this.cache.get<T[]>(key).payload;

		console.log('GET', obj.objName, new Date());
		const time = Date.now();
		const res = await asyncToPromise(obj.get.bind(obj))();
		const length = Date.now() - time;
		console.log('GET', obj.objName, `${length} ms`);

		if (res.body.OverallStatus == 'OK' ||
			res.body.OverallStatus == 'MoreDataAvailable') {
			// this.cache.set(key, res.body.Results as T[]);
			return res.body.Results as T[];
		} else {
			throw new Error(res.error || res);
		}
	}

	protected async putPromise<T = any>(obj: ApiObject) {
		console.log('PUT', obj.objName, new Date());
		const time = Date.now();
		const res = await asyncToPromise(obj.patch.bind(obj))();
		const length = Date.now() - time;
		console.log('PUT', obj.objName, `${length} ms`);
		console.log(res);

		if (res.body.OverallStatus == 'OK') {
			return res.body.Results as T;
		} else {
			throw new Error(res.error || res);
		}
	}

	protected getConfig(value?: string | string[], field = 'ID'): ApiObjectConfig {
		const config = { props: this.props } as ApiObjectConfig;

		if (value !== undefined && field !== undefined)
			config.filter = this.getFilter(value, field);

		return config;
	}

	protected getFilter(value?: string | string[], field = 'ID'): ApiObjectFilter {
		const filter = {
			operator: 'equals',
			leftOperand: field,
			rightOperand: value
		};

		if (typeof value !== 'string') {
			if (value.length == 0) {
				throw new Error('Filter array cannot be empty');
			} else if (value.length == 1) {
				filter.rightOperand = value[0];
			} else {
				filter.operator = 'IN';
			}
		}

		return filter;
	}
}
