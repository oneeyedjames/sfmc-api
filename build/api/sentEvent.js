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
exports.SentEventApi = void 0;
const object_1 = require("./object");
class SentEventApi extends object_1.ObjectApi {
    constructor(client) {
        super(client);
        this.props = [
            'SendID',
            'EventDate',
            'EventType',
            'SubscriberKey'
        ];
    }
    get(value, field = 'ID') {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = this.getOptions(value, field);
            const events = yield this.toPromise(this.client.sentEvent(opts));
            return events;
        });
    }
}
exports.SentEventApi = SentEventApi;
