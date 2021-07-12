"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactExt = void 0;
const dataExt_1 = require("./dataExt");
class ContactExt extends dataExt_1.DataExtApi {
    onInit() {
        this.extName = 'Contact_Salesforce';
        this.props = [
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
    }
}
exports.ContactExt = ContactExt;
