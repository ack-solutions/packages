"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhereBuilder = void 0;
const types_1 = require("./types");
class WhereBuilder {
    constructor(where) {
        this.whereObject = {};
        this.whereObject = where || {};
    }
    clear() {
        this.whereObject = {};
        return this;
    }
    where(...args) {
        this.parseCondition(null, ...args);
        return this;
    }
    andWhere(...args) {
        this.parseCondition(types_1.WhereLogicalOperatorEnum.AND, ...args);
        return this;
    }
    orWhere(...args) {
        this.parseCondition(types_1.WhereLogicalOperatorEnum.OR, ...args);
        return this;
    }
    removeWhere(field) {
        const keys = field.split('.');
        let current = this.whereObject;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                return this;
            }
            current = current[keys[i]];
        }
        delete current[keys[keys.length - 1]];
        return this;
    }
    hasConditions() {
        return Object.keys(this.whereObject).length > 0;
    }
    toObject() {
        return this.whereObject;
    }
    toJson() {
        return JSON.stringify(this.whereObject);
    }
    parseCondition(type, ...args) {
        let field;
        let operator;
        let value;
        if (args.length === 0) {
        }
        else if (args.length === 1) {
            const condition = args[0];
            if (typeof condition === 'function') {
                const builder = new WhereBuilder();
                condition(builder);
                this.updateCondition(builder.toObject(), type);
            }
            else if (condition instanceof WhereBuilder) {
                this.updateCondition(condition.toObject(), type);
            }
            else {
                this.updateCondition(condition, type);
            }
        }
        else if (args.length === 2 || args.length === 3) {
            if (args.length === 2) {
                field = args[0];
                value = args[1];
                if (typeof value === 'object') {
                    const firstKey = Object.keys(value)[0];
                    if (firstKey.startsWith('$')) {
                        this.updateCondition({ [field]: value }, type);
                    }
                    else {
                        this.updateCondition({ [field]: { [types_1.WhereOperatorEnum.EQ]: value } }, type);
                    }
                }
                else {
                    this.updateCondition({ [field]: { [types_1.WhereOperatorEnum.EQ]: value } }, type);
                }
            }
            else {
                field = args[0];
                operator = args[1];
                value = args[2];
                this.updateCondition({ [field]: { [operator]: value } }, type);
            }
        }
        return this;
    }
    updateCondition(condition, type) {
        if (type === null) {
            this.whereObject = {
                ...this.whereObject,
                ...condition,
            };
        }
        else {
            this.whereObject[type] = [...(this.whereObject[type] || []), condition].filter(Boolean);
        }
    }
}
exports.WhereBuilder = WhereBuilder;
//# sourceMappingURL=where-builder.js.map