import { QueryBuilderOptions, OrderDirectionEnum } from './types';
import { WhereBuilderCondition } from './where-builder';
export declare class QueryBuilder {
    private options;
    private whereBuilder;
    private relationBuilder;
    constructor(options: QueryBuilderOptions);
    setOptions(options: QueryBuilderOptions): this;
    mergeOptions(options: QueryBuilderOptions, deep?: boolean): this;
    addSelect(fields: string | string[]): this;
    removeSelect(fields: string | string[]): this;
    addRelation(relation: string, select?: string[], where?: Record<string, any>): this;
    removeRelation(relation: string): this;
    where(...args: WhereBuilderCondition): this;
    andWhere(...args: WhereBuilderCondition): this;
    orWhere(...args: WhereBuilderCondition): this;
    addOrder(orderBy: string, order: OrderDirectionEnum): this;
    removeOrder(orderBy: string): this;
    setSkip(skip: number): this;
    setTake(take: number): this;
    toObject(): {
        select?: string[];
        relations?: string[] | import("./types").Relation[];
        where?: Record<string, any>;
        order?: Record<string, OrderDirectionEnum>;
        skip?: number;
        take?: number;
    };
    toJson(): string;
}
