"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataExtApi = void 0;
const object_1 = require("./object");
class DataExtApi extends object_1.ObjectApi {
    constructor(factory, extName, props = [], propMap = {}) {
        super(factory, [...DataExtApi.Props, ...props]);
        this.extName = extName;
        this.propMap = propMap;
    }
    async get(value, field = 'Id') {
        const rows = await super.get(value, field);
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
DataExtApi.ContactPropMap = {
    Contact_Status__c: 'Status'
};
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
DataExtApi.SubscriptionPropMap = {
    Contact__c: 'ContactId',
    Global_Product__c: 'GlobalProductId',
    Line_of_Business__c: 'LineOfBusiness'
};
