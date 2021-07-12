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
exports.ListSubscriberApi = exports.ListApi = void 0;
const object_1 = require("./object");
class ListApi extends object_1.ObjectApi {
    constructor(factory, subFactory) {
        super(factory, ListApi.Props);
        this.listSubApi = new ListSubscriberApi(subFactory);
    }
    getBySubscriber(value, field = 'SubscriberKey') {
        return __awaiter(this, void 0, void 0, function* () {
            const listSubs = yield this.listSubApi.get(value, field);
            const listIds = Array.from(new Set(listSubs.map(ls => ls.ListID)));
            const lists = yield this.get(listIds);
            lists.forEach(list => {
                listSubs.filter(listSub => listSub.ListID == list.ID)
                    .forEach(listSub => listSub.List = list);
            });
            return listSubs;
        });
    }
}
exports.ListApi = ListApi;
ListApi.Props = [
    'ID',
    'ListName',
    'ListClassification',
    'Description',
    'Type'
];
class ListSubscriberApi extends object_1.ObjectApi {
    constructor(factory) {
        super(factory, ListSubscriberApi.Props);
    }
}
exports.ListSubscriberApi = ListSubscriberApi;
ListSubscriberApi.Props = [
    'SubscriberKey',
    'Status',
    'ListID',
    'CreatedDate',
    'ModifiedDate',
    'UnsubscribedDate'
];
