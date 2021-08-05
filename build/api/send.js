"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSendObject = exports.SendObject = exports.ListSendApi = exports.SendApi = void 0;
const api_1 = require("./api");
const object_1 = require("./object");
const list_1 = require("./list");
class SendApi extends object_1.ObjectApi {
    constructor(factory, listFactory) {
        super(factory, SendApi.Props);
        this.listSendApi = new ListSendApi(listFactory);
    }
    async get(value, field = 'ID') {
        const sends = await super.get(value, field);
        const sendIds = Array.from(new Set(sends.map(s => s.ID)));
        const listSends = await this.listSendApi.get(sendIds);
        listSends.forEach((listSend) => {
            const send = sends.find(send => send.ID == listSend.SendID);
            if (send !== undefined)
                send.List = listSend.List;
        });
        return sends;
    }
}
exports.SendApi = SendApi;
SendApi.Props = [
    'ID',
    'SentDate',
    'EmailName'
];
class ListSendApi extends object_1.ObjectApi {
    constructor(factory) {
        super(factory, ListSendApi.Props);
    }
    async get(value, field = 'SendID') {
        const listSends = await super.get(value, field);
        listSends.forEach(listSend => list_1.ListApi.populateListCode(listSend.List));
        return listSends;
    }
}
exports.ListSendApi = ListSendApi;
ListSendApi.Props = [
    'SendID',
    'List.ID',
    'List.ListName'
];
class SendObject extends api_1.ApiObject {
    constructor(parent, config) {
        super('Send', parent, config);
    }
}
exports.SendObject = SendObject;
class ListSendObject extends api_1.ApiObject {
    constructor(parent, config) {
        super('ListSend', parent, config);
    }
}
exports.ListSendObject = ListSendObject;
