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
exports.ListSendObject = exports.SendObject = exports.ListSendApi = exports.SendApi = void 0;
const api_1 = require("./api");
const object_1 = require("./object");
class SendApi extends object_1.ObjectApi {
    constructor(factory, listFactory) {
        super(factory, SendApi.Props);
        this.listSendApi = new ListSendApi(listFactory);
    }
    get(value, field = 'ID') {
        const _super = Object.create(null, {
            get: { get: () => super.get }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const sends = yield _super.get.call(this, value, field);
            const sendIds = Array.from(new Set(sends.map(s => s.ID)));
            const listSends = yield this.listSendApi.get(sendIds);
            listSends.forEach((listSend) => {
                const send = sends.find(send => send.ID == listSend.SendID);
                if (send !== undefined)
                    send.List = listSend.List;
            });
            return sends;
        });
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
    get(value, field = 'SendID') {
        return super.get(value, field);
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
