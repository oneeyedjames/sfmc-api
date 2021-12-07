"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataExtApi = void 0;
const object_1 = require("./object");
/**
 * Represents data in synchronized data extensions.
 *
 * Contact and Subscription objects are synced from Salesforce every 15 minutes.
 */
class DataExtApi extends object_1.ObjectApi {
    constructor(factory, extName, props = [], propMap = {}) {
        super(factory, props /*[...DataExtApi.Props, ...props]*/);
        this.extName = extName;
        this.propMap = propMap;
    }
    async get(value, field = 'Id', extra) {
        const rows = await super.get(value, field, extra);
        return rows.map(row => {
            const data = {};
            row.Properties.Property.forEach((prop) => {
                let key = (this.propMap[prop.Name] || prop.Name);
                key = key.replace(/__c$/, '').replace('_', '').replace('_', '');
                data[key] = prop.Value;
            });
            return data;
        });
    }
    getConfig(value, field = 'Id', extra) {
        const config = super.getConfig(value, field, extra);
        config.Name = this.extName;
        return config;
    }
}
exports.DataExtApi = DataExtApi;
// static readonly Props = [
// 	'Id'
// ];
DataExtApi.ContactType = 'Contact_Salesforce';
DataExtApi.ContactProps = [
    'Id',
    'Legacy_Id__c',
    'Customer_Number__c',
    'BusinessLocation__c',
    'Name',
    'Email',
    'Country__c',
    'Contact_Status__c',
    'Time_Zone__c'
];
DataExtApi.ContactPropMap = {
    Contact_Status__c: 'Status'
};
DataExtApi.SubscriptionType = 'Subscription__c_Salesforce';
DataExtApi.SubscriptionProps = [
    'Id',
    'Business_Location__c',
    'Line_of_Business__c',
    'Contact__c',
    'Global_Product__c',
    'Global_Product_Code__c',
    'Status__c',
    'Inactive_Reason__c',
    'Welcome_Status__c'
];
DataExtApi.SubscriptionPropMap = {
    Contact__c: 'ContactId',
    Global_Product__c: 'GlobalProductId',
    Line_of_Business__c: 'LineOfBusiness'
};
DataExtApi.UnsubscribeType = 'Global_Unsubscribes';
DataExtApi.UnsubscribeProps = [
    'BusinessUnitID',
    'SubscriberID',
    'SubscriberKey',
    'UnsubDateUTC',
    'UnsubReason'
];
