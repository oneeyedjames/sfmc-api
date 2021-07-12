"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionExt = void 0;
const dataExt_1 = require("./dataExt");
class SubscriptionExt extends dataExt_1.DataExtApi {
    onInit() {
        this.extName = 'Subscription__c_Salesforce';
        this.props = [
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
    }
}
exports.SubscriptionExt = SubscriptionExt;
