"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnitObject = exports.BusinessUnitApi = void 0;
const api_1 = require("./api");
const object_1 = require("./object");
class BusinessUnitApi extends object_1.ObjectApi {
    constructor(factory) {
        super(factory, BusinessUnitApi.Props);
    }
}
exports.BusinessUnitApi = BusinessUnitApi;
BusinessUnitApi.Props = [
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
/**
 * Backfill for missing SOAP object in FuelSDK
 */
class BusinessUnitObject extends api_1.ApiObject {
    constructor(parent, config) {
        super('BusinessUnit', parent, config);
    }
}
exports.BusinessUnitObject = BusinessUnitObject;
