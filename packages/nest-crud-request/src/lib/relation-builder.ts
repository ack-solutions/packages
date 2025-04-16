import { Relation } from './types';


export class RelationBuilder {

    private relations: Record<string, Relation> = {};

    constructor(relations?: Relation[] | string[] | string) {
        if (relations) {
            this.setRelations(relations);
        }
    }

    setRelations(relations: Relation[] | string[] | string): this {
        if (relations) {
            if (Array.isArray(relations)) {
                relations.forEach(relation => {
                    if (typeof relation === 'string') {
                        this.add(relation);
                    } else {
                        this.add(relation.relation, relation.select, relation.where);
                    }
                });
            } else if (typeof relations === 'string') {
                this.add(relations);
            } else {
                this.relations = relations;
            }
        }
        return this;
    }

    clear(): this {
        this.relations = {};
        return this;
    }

    add(relation: string, select?: string[], where?: Record<string, any>): this {
        this.relations[relation] = {
            relation,
            select,
            where,
        };
        return this;
    }

    remove(relation: string): this {
        delete this.relations[relation];
        return this;
    }

    hasRelations(): boolean {
        return Object.keys(this.relations).length > 0;
    }

    toObject(): Relation[] {
        return Object.values(this.relations);
    }

    toJson(): string {
        return JSON.stringify(this.relations);
    }

}
