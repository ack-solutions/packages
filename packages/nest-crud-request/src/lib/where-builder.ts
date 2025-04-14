import { WhereLogicalOperatorEnum, WhereOperatorEnum } from './types';


export type WhereBuilderCondition = [string, any] | [string, WhereOperatorEnum, any] | [Record<string, any>] | [(builder: WhereBuilder) => void];

export class WhereBuilder {

    private whereObject: Record<string, any> = {};

    constructor(where?: Record<string, any>) {
        this.whereObject = where || {};
    }

    clear(): this {
        this.whereObject = {};
        return this;
    }

    where(...args: WhereBuilderCondition): this {
        this.parseCondition(null, ...args);
        return this;
    }

    andWhere(...args: WhereBuilderCondition): this {
        this.parseCondition(WhereLogicalOperatorEnum.AND, ...args);
        return this;
    }

    orWhere(...args: WhereBuilderCondition): this {
        this.parseCondition(WhereLogicalOperatorEnum.OR, ...args);
        return this;
    }

    removeWhere(field: string): this {
        const keys = field.split('.');
        let current = this.whereObject;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                return this; // If the path doesn't exist, do nothing
            }
            current = current[keys[i]];
        }

        delete current[keys[keys.length - 1]];
        return this;
    }

    hasConditions(): boolean {
        return Object.keys(this.whereObject).length > 0;
    }

    toObject(): Record<string, any> {
        return this.whereObject;
    }

    toJson(): string {
        return JSON.stringify(this.whereObject);
    }

    private parseCondition(type: WhereLogicalOperatorEnum | null, ...args: any[]): Record<string, any> {
        let field: string;
        let operator: WhereOperatorEnum;
        let value: any;

        if (args.length === 0) {
            // Do nothing
        } else if (args.length === 1) {
            const condition = args[0];
            if (typeof condition === 'function') {
                // If the condition is a function, create a new WhereBuilder and call the function with it
                const builder = new WhereBuilder();
                condition(builder);
                this.updateCondition(builder.toObject(), type);
            } else if (condition instanceof WhereBuilder) {
                // If the condition is a WhereBuilder
                this.updateCondition(condition.toObject(), type);
            } else {
                // If the condition is a simple object
                this.updateCondition(condition, type);
            }
        } else if (args.length === 2 || args.length === 3) {
            if (args.length === 2) {
                // if there are only two arguments, the operator is EQ
                field = args[0];
                value = args[1];
                if (typeof value === 'object') {
                    const firstKey = Object.keys(value)[0];
                    // if the first key is a operator, update the value with the operator
                    if (firstKey.startsWith('$')) {
                        this.updateCondition({ [field]: value }, type);
                    } else {
                        this.updateCondition({ [field]: { [WhereOperatorEnum.EQ]: value } }, type);
                    }
                } else {
                    this.updateCondition({ [field]: { [WhereOperatorEnum.EQ]: value } }, type);
                }
            } else {
                // if there are three arguments, the operator is the second argument
                field = args[0];
                operator = args[1];
                value = args[2];
                this.updateCondition({ [field]: { [operator]: value } }, type);
            }
        }
        return this;
    }

    // private updateCondition(condition: Record<string, any>, type: '$and' | '$or'): void {
    //     this.whereObject[type] = [...(this.whereObject[type] || []), condition].filter(Boolean);
    // }

    private updateCondition(condition: Record<string, any>, type: WhereLogicalOperatorEnum | null): void {
        if (type === null) {
            this.whereObject = {
                ...this.whereObject,
                ...condition,
            };
        } else {
            this.whereObject[type] = [...(this.whereObject[type] || []), condition].filter(Boolean);
        }
    }

}
