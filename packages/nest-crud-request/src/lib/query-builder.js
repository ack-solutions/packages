"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const relation_builder_1 = require("./relation-builder");
const utils_1 = require("./utils");
const where_builder_1 = require("./where-builder");
class QueryBuilder {
    constructor(options) {
        this.options = {};
        this.whereBuilder = new where_builder_1.WhereBuilder();
        this.relationBuilder = new relation_builder_1.RelationBuilder();
        this.options = options;
        this.setOptions(options);
    }
    setOptions(options) {
        this.options = options;
        this.whereBuilder = new where_builder_1.WhereBuilder(options.where);
        this.relationBuilder = new relation_builder_1.RelationBuilder(options.relations);
        return this;
    }
    mergeOptions(options, deep = false) {
        let updatedOptions = {};
        if (deep) {
            updatedOptions = (0, utils_1.deepMerge)(this.options, options);
        }
        else {
            updatedOptions = {
                ...this.options,
                ...options,
            };
        }
        this.setOptions(updatedOptions);
        return this;
    }
    addSelect(fields) {
        if (!this.options.select) {
            this.options.select = [];
        }
        if (Array.isArray(fields)) {
            this.options.select.push(...fields);
        }
        else {
            this.options.select.push(fields);
        }
        return this;
    }
    removeSelect(fields) {
        if (this.options.select) {
            if (Array.isArray(fields)) {
                this.options.select = this.options.select.filter(field => !fields.includes(field));
            }
            else {
                this.options.select = this.options.select.filter(field => field !== fields);
            }
        }
        return this;
    }
    addRelation(relation, select, where) {
        this.relationBuilder.add(relation, select, where);
        return this;
    }
    removeRelation(relation) {
        this.relationBuilder.remove(relation);
        return this;
    }
    where(...args) {
        this.whereBuilder.where(...args);
        return this;
    }
    andWhere(...args) {
        this.whereBuilder.andWhere(...args);
        return this;
    }
    orWhere(...args) {
        this.whereBuilder.orWhere(...args);
        return this;
    }
    addOrder(orderBy, order) {
        if (!this.options.order) {
            this.options.order = {};
        }
        this.options.order[orderBy] = order;
        return this;
    }
    removeOrder(orderBy) {
        if (this.options.order) {
            delete this.options.order[orderBy];
        }
        return this;
    }
    setSkip(skip) {
        this.options.skip = skip;
        return this;
    }
    setTake(take) {
        this.options.take = take;
        return this;
    }
    toObject() {
        const options = {
            ...this.options,
        };
        if (this.whereBuilder.hasConditions()) {
            options.where = this.whereBuilder.toObject();
        }
        else {
            delete options.where;
        }
        if (this.relationBuilder.hasRelations()) {
            options.relations = this.relationBuilder.toObject();
        }
        else {
            delete options.relations;
        }
        return options;
    }
    toJson() {
        const obj = this.toObject();
        return JSON.stringify(obj);
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map