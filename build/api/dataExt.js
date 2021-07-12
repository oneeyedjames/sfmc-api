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
exports.DataExtApi = void 0;
const object_1 = require("./object");
class DataExtApi extends object_1.ObjectApi {
    constructor(factory, extName, props = []) {
        super(factory, [...DataExtApi.Props, ...props]);
        this.extName = extName;
    }
    get(value, field = 'Id') {
        const _super = Object.create(null, {
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield _super.get.call(this, value, field);
            return rows.map(row => {
                const data = {};
                row.Properties.Property.forEach((prop) => {
                    const key = prop.Name
                        .replace(/__c$/, '')
                        .replace('_', '')
                        .replace('_', '');
                    data[key] = prop.Value;
                });
                return data;
            });
        });
    }
    getConfig(value, field = 'Id') {
        const config = super.getConfig(value, field);
        config.Name = this.extName;
        return config;
    }
}
exports.DataExtApi = DataExtApi;
DataExtApi.Props = [
    'Id'
];
DataExtApi.ContactType = 'Contact_Salesforce';
DataExtApi.ContactProps = [
    'Legacy_Id__c',
    'Customer_Number__c',
    'BusinessLocation__c',
    'Name',
    'Email',
    'Country__c',
    'Contact_Status__c',
    'Time_Zone__c'
];
DataExtApi.SubscriptionType = 'Subscription__c_Salesforce';
DataExtApi.SubscriptionProps = [
    'Business_Location__c',
    'Line_of_Business__c',
    'Contact__c',
    'Global_Product__c',
    'Global_Product_Code__c',
    'Status__c',
    'Inactive_Reason__c',
    'Welcome_Status__c'
];
