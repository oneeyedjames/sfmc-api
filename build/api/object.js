"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectApi = void 0;
const async_1 = require("../async");
class ObjectApi {
    // private cache = new Cache();
    constructor(getObject, props = []) {
        this.getObject = getObject;
        this.props = props;
    }
    get(value, field = 'ID') {
        if (this.getObject !== undefined) {
            const config = this.getConfig(value, field);
            return this.getPromise(this.getObject(config));
        }
        else {
            return Promise.reject('No API Object');
        }
    }
    async getPromise(obj) {
        // const key = JSON.stringify(obj.config);
        //
        // if (this.cache.isset(key))
        // 	return this.cache.get<T[]>(key).payload;
        console.log('GET', obj.objName, new Date());
        const time = Date.now();
        const res = await async_1.asyncToPromise(obj.get.bind(obj))();
        const length = Date.now() - time;
        console.log('GET', obj.objName, `${length} ms`);
        if (res.body.OverallStatus == 'OK' ||
            res.body.OverallStatus == 'MoreDataAvailable') {
            // this.cache.set(key, res.body.Results as T[]);
            return res.body.Results;
        }
        else {
            throw new Error(res.error || res);
        }
    }
    getConfig(value, field = 'ID') {
        const config = { props: this.props };
        if (value !== undefined && field !== undefined)
            config.filter = this.getFilter(value, field);
        return config;
    }
    getFilter(value, field = 'ID') {
        const filter = {
            operator: 'equals',
            leftOperand: field,
            rightOperand: value
        };
        if (typeof value !== 'string') {
            if (value.length > 1) {
                filter.operator = 'IN';
            }
            else {
                filter.rightOperand = value[0];
            }
        }
        return filter;
    }
}
exports.ObjectApi = ObjectApi;
