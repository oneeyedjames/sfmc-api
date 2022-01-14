"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSubscriberEvent = exports.formatSubscriberList = exports.formatSubscriber = void 0;
function formatSubscriber(sub) {
    sub.ObjectID = undefined;
    sub.PartnerKey = undefined;
    if (sub.Lists !== undefined)
        sub.Lists.forEach(formatSubscriberList);
    if (sub.Events !== undefined)
        sub.Events.forEach(formatSubscriberEvent);
    return sub;
}
exports.formatSubscriber = formatSubscriber;
function formatSubscriberList(listSub) {
    listSub.ObjectID = undefined;
    listSub.PartnerKey = undefined;
    listSub.SubscriberKey = undefined;
    if (listSub.List !== undefined) {
        listSub.ListName = listSub.List.ListName;
        listSub.ListCode = listSub.List.ListCode;
        listSub.ListClassification = listSub.List.ListClassification;
        listSub.List = undefined;
    }
    if (listSub.PartnerProperties !== undefined) {
        listSub.UnsubscribedDate = listSub.PartnerProperties.Value;
        listSub.PartnerProperties = undefined;
    }
    return listSub;
}
exports.formatSubscriberList = formatSubscriberList;
function formatSubscriberEvent(event) {
    event.ObjectID = undefined;
    event.PartnerKey = undefined;
    event.SubscriberKey = undefined;
    event.SendID = undefined;
    if (event.Send !== undefined) {
        event.ListID = event.Send.List.ID;
        event.ListName = event.Send.List.ListName;
        event.ListCode = event.Send.List.ListCode;
        event.EmailName = event.Send.EmailName;
        event.Send = undefined;
    }
    return event;
}
exports.formatSubscriberEvent = formatSubscriberEvent;
