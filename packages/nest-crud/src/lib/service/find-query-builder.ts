import { set, uniqBy } from 'lodash';
import { Relation, WhereOperatorEnum } from '@ackplus/nest-crud-request';
import { SelectQueryBuilder, FindManyOptions, Repository, Brackets, WhereExpressionBuilder, ObjectLiteral, Not, IsNull } from 'typeorm';

import { isBoolean } from '../helper/common';
import { IFindManyOptions } from '../interface/crud';


type WhereCondition = Record<string, any> | Array<Record<string, any>>;

type WhereQueryBuilder<T extends ObjectLiteral> = SelectQueryBuilder<T> | WhereExpressionBuilder;

export class FindQueryBuilder<T extends ObjectLiteral> {

    private whereIndex = 0;
    private relations: string[] = [];
    private queryBuilder: SelectQueryBuilder<T>;

    constructor(
        private readonly repository: Repository<T>,
        private readonly query: IFindManyOptions,
    ) {
        this.queryBuilder = repository.createQueryBuilder('entity');
        this.parseQuery();
    }

    private parseQuery() {
        if (this.query.relations) {
            this.buildRelations(this.query.relations);
        }

        if (this.query.where) {
            this.buildWhereConditions(this.query.where);
        }

        // Handle other options through setFindOptions
        const findOptions: FindManyOptions = {};

        if (this.query.order) {
            findOptions.order = this.buildOrder(this.query.order);
        }

        if (this.query.skip) {
            findOptions.skip = Number(this.query.skip);
        }

        if (this.query.take) {
            findOptions.take = Number(this.query.take);
        }

        if (this.query.onlyDeleted && this.repository.metadata.deleteDateColumn) {
            findOptions.withDeleted = true;
            findOptions.where = {
                [this.repository.metadata.deleteDateColumn.propertyName]: Not(IsNull()),
            };
        }

        this.queryBuilder.setFindOptions(findOptions);
    }

    private buildRelations(relations: any) {
        let queryRelations: Relation[] = [];
        if (Array.isArray(relations)) {
            relations.forEach(item => {
                if (typeof item === 'string') {
                    queryRelations.push({
                        relation: item,
                    });
                } else if (typeof item === 'object' && item.relation) {
                    queryRelations.push(item);
                }
            });
        } else if (typeof relations === 'string') {
            queryRelations = [
                {
                    relation: relations,
                },
            ];
        } else if (typeof relations === 'object') {
            Object.entries(relations).forEach(([key, value]) => {
                if (isBoolean(value)) {
                    if (value) {
                        queryRelations.push({
                            relation: key,
                        });
                    }
                }
            });
        }

        queryRelations = uniqBy(queryRelations, 'relation');

        // Add joins for explicitly requested relations
        queryRelations.forEach(({ relation, select, where }) => {
            const parts = relation.split('.');
            let currentPath = '';
            let currentAlias = 'entity';

            parts.forEach((part, index) => {
                currentPath = currentPath ? `${currentPath}.${part}` : part;
                const relationAlias = this.getRelationAlias(currentPath);

                this.relations.push(currentPath);

                const condition: string[] = [];
                const conditionParameter: Record<string, any> = {};

                let isSelectAll = true;
                if (index === part?.length - 1) {
                    if (where) {
                        Object.entries(where).forEach(([key, value]) => {
                            const paramName = `relation_condition_${currentAlias}_${key}`;
                            conditionParameter[paramName] = value;
                            condition.push(`"${currentAlias}"."${key}" = :${paramName}`);
                        });
                    }

                    if (select) {
                        select.forEach(([key, value]) => {
                            this.queryBuilder.addSelect(`${currentAlias}.${key}`, value);
                        });
                        isSelectAll = false;
                    }
                }

                const joinMethod = isSelectAll ? 'leftJoinAndSelect' : 'leftJoin';

                this.queryBuilder[joinMethod](
                    `${currentAlias}.${part}`,
                    relationAlias,
                    condition.join(' AND '),
                    conditionParameter,
                );

                currentAlias = relationAlias;
            });
        });
    }

    private buildOrder(order: Record<string, 'ASC' | 'DESC'>) {
        const parsedOrder: any = {};

        Object.entries(order).forEach(([key, direction]) => {
            if (key.includes('.')) {
                this.updateRelations(key);
                set(parsedOrder, key, direction);
            } else {
                set(parsedOrder, key, direction);
            }
        });
        return parsedOrder;
    }

    private buildWhereConditions(conditions: WhereCondition, logicalOperator = '$and', qb: WhereQueryBuilder<T> = this.queryBuilder) {
        const operatorFn = logicalOperator === '$and' ? 'andWhere' : 'orWhere';
        if (Array.isArray(conditions)) {
            conditions.forEach(condition => {
                qb[operatorFn](new Brackets(whereQb => {
                    this.buildWhereConditions(condition, logicalOperator, whereQb);
                }));
            });
        } else {
            Object.entries(conditions).forEach(([key, value]) => {
                qb[operatorFn](new Brackets(whereQb => {
                    this.processCondition(key, value, logicalOperator, whereQb);
                }));
            });
        }
    }


    private processCondition(key: string, value: any, logicalOperator: string, qb: WhereQueryBuilder<T>) {
        if (this.isLogicalOperator(key)) {
            // Handle $and/$or operators
            this.buildWhereConditions(value, key, qb);
        } else {
            // Handle array, object or simple value
            this.handleValue(key, value, logicalOperator, qb);
        }
    }

    private handleNestedRelation(key: string, value: any, logicalOperator: string, qb: WhereQueryBuilder<T>) {
        const { columnName } = this.updateRelations(key);
        this.addWhereCondition(columnName, value, logicalOperator, qb);
    }

    private handleValue(key: string, value: any, logicalOperator: string, qb: WhereQueryBuilder<T>) {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                // Handle empty array
                // Do Nothing
            } else if (value.every(item => typeof item !== 'object')) {
                // Handle array of primitives, i.e [1, 2, 3] or ['a', 'b', 'c']
                this.addWhereCondition(`"entity"."${key}"`, { $in: value }, logicalOperator, qb);
            }
            return;
        } if (key.includes('.')) {
            // Handle nested relations
            this.handleNestedRelation(key, value, logicalOperator, qb);
            return;
        }
        // Handle simple values
        this.addWhereCondition(`"entity"."${key}"`, value, logicalOperator, qb);
    }

    private isLogicalOperator(key: string): boolean {
        return key === '$and' || key === '$or';
    }


    private getRelationAlias(path: string): string {
        // Convert path like 'user.posts.comments' to 'user_posts_comments'
        return path.replace(/\./g, '_');
    }

    private updateRelations(relationName: string) {
        // Handle nested relation ordering
        const parts = relationName.split('.');
        const field = parts.pop()!;
        let currentPath = '';
        let currentAlias = 'entity';

        // Add joins for nested relations if not already added
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath = currentPath ? `${currentPath}.${part}` : part;
            const relationAlias = this.getRelationAlias(currentPath);

            if (!this.relations.includes(currentPath)) {
                this.relations.push(currentPath);
                this.queryBuilder.leftJoin(
                    `${currentAlias}.${part}`,
                    relationAlias,
                );
            }
            currentAlias = relationAlias;
        }

        return {
            columnName: `"${currentAlias}"."${field}"`,
            alias: currentAlias,
            field,
        };
    }


    private addWhereCondition(columnName: string, value: any, logicalOperator: string, qb: WhereQueryBuilder<T> = this.queryBuilder) {
        this.whereIndex++;
        const operatorFn = logicalOperator === '$and' ? 'andWhere' : 'orWhere';
        const paramName = `param_${this.whereIndex}`;

        if (value === 'true' || value === 'TRUE') {
            value = true;
        } else if (value === 'false' || value === 'FALSE') {
            value = false;
        }

        if (typeof value !== 'object' || value === null) {
            qb[operatorFn](`${columnName} = :${paramName}`, { [paramName]: value });
            return;
        }

        const [operator, operatorValue] = Object.entries(value)[0];

        switch (operator) {
            case WhereOperatorEnum.EQ:
                qb[operatorFn](`${columnName} = :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.NOT_EQ:
                qb[operatorFn](`${columnName} != :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.GT:
                qb[operatorFn](`${columnName} > :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.GT_OR_EQ:
                qb[operatorFn](`${columnName} >= :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.LT:
                qb[operatorFn](`${columnName} < :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.LT_OR_EQ:
                qb[operatorFn](`${columnName} <= :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.LIKE:
                qb[operatorFn](`${columnName} LIKE :${paramName}`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.NOT_LIKE:
                qb[operatorFn](`${columnName}::text NOT LIKE :${paramName}::text`, { [paramName]: operatorValue });
                break;

            case WhereOperatorEnum.ILIKE:
                qb[operatorFn](`${columnName}::text ILIKE :${paramName}::text`, { [paramName]: operatorValue });
                break;

            case WhereOperatorEnum.NOT_ILIKE:
                qb[operatorFn](`${columnName}::text NOT ILIKE :${paramName}::text`, { [paramName]: operatorValue });
                break;

            case WhereOperatorEnum.IN:
                if (Array.isArray(operatorValue) && operatorValue.length === 0) {
                    qb[operatorFn]('1 = 0'); // Always false for empty IN clause
                } else {
                    qb[operatorFn](`${columnName} IN (:...${paramName})`, { [paramName]: operatorValue });
                }
                break;
            case WhereOperatorEnum.NOT_IN:
                qb[operatorFn](`${columnName} NOT IN (:...${paramName})`, { [paramName]: operatorValue });
                break;
            case WhereOperatorEnum.IS_NULL:
                qb[operatorFn](`${columnName} IS NULL`);
                break;
            case WhereOperatorEnum.IS_NOT_NULL:
                qb[operatorFn](`${columnName} IS NOT NULL`);
                break;
            case WhereOperatorEnum.BETWEEN:
            case WhereOperatorEnum.NOT_BETWEEN: {
                const [start, end] = operatorValue as any;
                const isBetween = operator === WhereOperatorEnum.BETWEEN;
                qb[operatorFn](
                    `${columnName} ${isBetween ? 'BETWEEN' : 'NOT BETWEEN'} :${paramName}_0 AND :${paramName}_1`,
                    {
                        [`${paramName}_0`]: start,
                        [`${paramName}_1`]: end,
                    },
                );
                break;
            }
            case WhereOperatorEnum.IS_TRUE:
                qb[operatorFn](`${columnName} IS TRUE`);
                break;

            case WhereOperatorEnum.IS_FALSE:
                qb[operatorFn](`${columnName} IS FALSE`);
                break;

            default:
                // Pass through if not a recognized operator
                break;
        }
    }

    getQueryBuilder(): SelectQueryBuilder<T> {
        return this.queryBuilder;
    }

    getManyAndCount() {
        return this.queryBuilder.getManyAndCount();
    }

    async getMany() {
        return this.queryBuilder.getMany();
    }

}
