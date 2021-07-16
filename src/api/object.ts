import { asyncToPromise } from '../async';

import {
	ApiObject,
	ApiObjectFactory,
	ApiObjectConfig,
	ApiObjectFilter
} from './api';

export class ObjectApi {
	private cache: {[key:string]:string} = {};
	private cacheTTL = 900000; // 15 minutes

	constructor(
		protected getObject: ApiObjectFactory,
		protected props: string[] = []
	) {}

	get(value?: string | string[], field = 'ID') {
		if (this.getObject !== undefined) {
			const config = this.getConfig(value, field);
			return this.toPromise(this.getObject(config));
		} else {
			return Promise.reject('No API Object');
		}
	}

	protected async toPromise<T = any>(req: ApiObject) {
		const key = JSON.stringify(req.config);
		if (this.cache[key] !== undefined) {
			console.log('CACHE', req.objName, new Date());
			return JSON.parse(this.cache[key]) as T[];
		}

		console.log('GET', req.objName, new Date());
		const time = Date.now();

		const res = await asyncToPromise(req.get.bind(req));

		const length = Date.now() - time;
		console.log('GET', req.objName, `${length} ms`);

		// if (length > 1000) {
		// 	console.log(req.config, `${res.body.Results.length} records`);
		// }

		if (res.body.OverallStatus == 'OK' ||
			res.body.OverallStatus == 'MoreDataAvailable') {
			setTimeout(() => delete this.cache[key], this.cacheTTL);
			this.cache[key] = JSON.stringify(res.body.Results);
			return res.body.Results as T[];
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
			if (value.length > 1) {
				filter.operator = 'IN';
			} else {
				filter.rightOperand = value[0];
			}
		}

		return filter;
	}
}
