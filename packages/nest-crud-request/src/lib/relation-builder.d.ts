import { Relation } from './types';
export declare class RelationBuilder {
    private relations;
    constructor(relations?: Relation[] | string[] | string);
    setRelations(relations: Relation[] | string[] | string): this;
    clear(): this;
    add(relation: string, select?: string[], where?: Record<string, any>): this;
    remove(relation: string): this;
    hasRelations(): boolean;
    toObject(): Relation[];
    toJson(): string;
}
