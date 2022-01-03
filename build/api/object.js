"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectApi = void 0;
const async_1 = require("../async");
class ObjectApi {
    constructor(getObject, props = []) {
        this.getObject = getObject;
        this.props = props;
    }
    get(value, field = 'ID', extra) {
        if (this.getObject !== undefined) {
            const config = this.getConfig(value, field, extra);
            return this.getPromise(this.getObject(config));
        }
        else {
            return Promise.reject('No API Object');
        }
    }
    put(props) {
        if (this.getObject !== undefined) {
            const config = this.getConfig();
            config.props = props;
            return this.putPromise(this.getObject(config));
        }
        else {
            return Promise.reject('No API Object');
        }
    }
    async getPromise(obj) {
        const res = await async_1.asyncToPromise(obj.get.bind(obj))();
        if (res.body.OverallStatus == 'OK' ||
            res.body.OverallStatus == 'MoreDataAvailable') {
            return res.body.Results;
        }
        else {
            throw new Error(res.error || res);
        }
    }
    async putPromise(obj) {
        const res = await async_1.asyncToPromise(obj.patch.bind(obj))();
        if (res.body.OverallStatus == 'OK') {
            return res.body.Results;
        }
        else {
            throw new Error(res.error || res);
        }
    }
    getConfig(value, field = 'ID', extra) {
        const config = { props: this.props };
        if (value !== undefined && field !== undefined)
            config.filter = this.getFilter(value, field, extra);
        // console.log(value, field, extra, config.filter);
        return config;
    }
    getFilter(value, field = 'ID', extra) {
        if (Array.isArray(value)) {
            if (value.length == 1) {
                value = value[0];
            }
            else if (value.length == 0) {
                throw new Error('Filter array cannot be empty');
            }
        }
        const filter = {
            operator: Array.isArray(value) ? 'IN' : 'equals',
            leftOperand: field,
            rightOperand: value
        };
        if (extra === undefined)
            return filter;
        return {
            operator: 'OR',
            leftOperand: { ...filter },
            rightOperand: { ...filter, leftOperand: extra }
        };
    }
}
exports.ObjectApi = ObjectApi;
