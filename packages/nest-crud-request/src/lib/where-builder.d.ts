import { WhereOperatorEnum } from './types';
export type WhereBuilderCondition = [string, any] | [string, WhereOperatorEnum, any] | [Record<string, any>] | [(builder: WhereBuilder) => void];
export declare class WhereBuilder {
    private whereObject;
    constructor(where?: Record<string, any>);
    clear(): this;
    where(...args: WhereBuilderCondition): this;
    andWhere(...args: WhereBuilderCondition): this;
    orWhere(...args: WhereBuilderCondition): this;
    removeWhere(field: string): this;
    hasConditions(): boolean;
    toObject(): Record<string, any>;
    toJson(): string;
    private parseCondition;
    private updateCondition;
}
