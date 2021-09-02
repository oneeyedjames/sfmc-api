"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSubscriberApi = exports.ListApi = void 0;
const object_1 = require("./object");
class ListApi extends object_1.ObjectApi {
    constructor(factory, subFactory) {
        super(factory, ListApi.Props);
        this.listSubApi = new ListSubscriberApi(subFactory);
    }
    async get(value, field = 'ID') {
        const lists = await super.get(value, field);
        lists.forEach(ListApi.populateListCode);
        return lists;
    }
    async getBySubscriber(value, field = 'SubscriberKey') {
        const listSubs = await this.listSubApi.get(value, field);
        if (listSubs.length == 0)
            return listSubs;
        const listIds = Array.from(new Set(listSubs.map(ls => ls.ListID)));
        const lists = await this.get(listIds);
        lists.forEach(list => {
            listSubs.filter(listSub => listSub.ListID == list.ID)
                .forEach(listSub => listSub.List = list);
        });
        return listSubs.filter(listSub => listSub.List &&
            listSub.List.ListClassification == 'PublicationList');
    }
    /**
     * Parses the given list name for a product code. Publication lists are
     * expected to follow this naming convention:
     *
     *   <Product Code> - <Product Description>
     *
     */
    static populateListCode(list) {
        const name = list.ListName;
        const keys = name.match(/^(.+) - .+$/i);
        list.ListCode = keys ? keys[1] : undefined;
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
