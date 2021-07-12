"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiObject = void 0;
class ApiObject {
    constructor(objName, parent, config) {
        this.objName = objName;
        this.parent = parent;
        this.config = config;
        this.props = config.props || [];
        this.options = config.options || {};
    }
    get(cb) {
        var filter = this.config.filter ? { filter: this.config.filter } : null;
        if (this.props.length == 0) {
            cb({ error: `A property list is required for ${this.objName} retrieval.` });
        }
        else {
            this.parent.SoapClient.retrieve(this.objName, this.props, filter, cb);
        }
    }
    post(cb) {
        this.parent.SoapClient.create(this.objName, this.props, this.options, cb);
    }
    patch(cb) {
        this.parent.SoapClient.update(this.objName, this.props, this.options, cb);
    }
    delete(cb) {
        this.parent.SoapClient.delete(this.objName, this.props, this.options, cb);
    }
}
exports.ApiObject = ApiObject;
