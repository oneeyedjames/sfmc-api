"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserObject = exports.UserApi = void 0;
const api_1 = require("./api");
const object_1 = require("./object");
class UserApi extends object_1.ObjectApi {
    constructor(factory) {
        super(factory, UserApi.Props);
    }
}
exports.UserApi = UserApi;
UserApi.Props = [
    'ID',
    'Name',
    'Email',
    'Roles',
    'ActiveFlag',
    'CustomerKey'
];
/**
 * Backfill for missing SOAP object in FuelSDK
 */
class UserObject extends api_1.ApiObject {
    constructor(parent, config) {
        super('AccountUser', parent, config);
    }
}
exports.UserObject = UserObject;
