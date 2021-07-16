"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectApi = void 0;
const async_1 = require("../async");
const cache_1 = require("../cache");
class ObjectApi {
    constructor(getObject, props = []) {
        this.getObject = getObject;
        this.props = props;
        this.cache = new cache_1.Cache();
    }
    get(value, field = 'ID') {
        if (this.getObject !== undefined) {
            const config = this.getConfig(value, field);
            return this.toPromise(this.getObject(config));
        }
        else {
            return Promise.reject('No API Object');
        }
    }
    toPromise(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = JSON.stringify(req.config);
            if (this.cache.isset(key))
                return this.cache.get(key).payload;
            console.log('GET', req.objName, new Date());
            const time = Date.now();
            const res = yield async_1.asyncToPromise(req.get.bind(req))();
            const length = Date.now() - time;
            console.log('GET', req.objName, `${length} ms`);
            // if (length > 1000) {
            // 	console.log(req.config, `${res.body.Results.length} records`);
            // }
            if (res.body.OverallStatus == 'OK' ||
                res.body.OverallStatus == 'MoreDataAvailable') {
                this.cache.set(key, res.body.Results);
                return res.body.Results;
            }
            else {
                throw new Error(res.error || res);
            }
        });
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
