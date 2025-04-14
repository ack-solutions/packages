"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationBuilder = void 0;
class RelationBuilder {
    constructor(relations) {
        this.relations = {};
        if (relations) {
            this.setRelations(relations);
        }
    }
    setRelations(relations) {
        if (relations) {
            if (Array.isArray(relations)) {
                relations.forEach(relation => {
                    if (typeof relation === 'string') {
                        this.add(relation);
                    }
                    else {
                        this.add(relation.relation, relation.select, relation.where);
                    }
                });
            }
            else if (typeof relations === 'string') {
                this.add(relations);
            }
            else {
                this.relations = relations || {};
            }
        }
        return this;
    }
    clear() {
        this.relations = {};
        return this;
    }
    add(relation, select, where) {
        this.relations[relation] = {
            relation,
            select,
            where,
        };
        return this;
    }
    remove(relation) {
        delete this.relations[relation];
        return this;
    }
    hasRelations() {
        return Object.keys(this.relations).length > 0;
    }
    toObject() {
        return Object.values(this.relations);
    }
    toJson() {
        return JSON.stringify(this.relations);
    }
}
exports.RelationBuilder = RelationBuilder;
//# sourceMappingURL=relation-builder.js.map