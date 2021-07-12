"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalProductApi = exports.ProductApi = void 0;
const dataExt_1 = require("./dataExt");
class ProductApi extends dataExt_1.DataExtApi {
    onInit() {
        this.extName = 'Product2_Salesforce';
        this.props = [
            'Id',
            'Line_of_Business__c',
            'Global_Product__c',
            'Publication__c',
            'ProductCode'
        ];
    }
}
exports.ProductApi = ProductApi;
class GlobalProductApi extends dataExt_1.DataExtApi {
    onInit() {
        this.extName = 'Global_Product__c_Salesforce';
        this.props = ['Id', 'Product_Code__c'];
    }
}
exports.GlobalProductApi = GlobalProductApi;
