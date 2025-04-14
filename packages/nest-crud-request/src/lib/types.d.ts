export interface QueryBuilderOptions {
    select?: string[];
    relations?: string[] | Relation[];
    where?: Record<string, any>;
    order?: Record<string, OrderDirectionEnum>;
    skip?: number;
    take?: number;
}
export declare enum WhereLogicalOperatorEnum {
    AND = "$and",
    OR = "$or"
}
export declare enum WhereOperatorEnum {
    EQ = "$eq",
    NOT_EQ = "$ne",
    GT = "$gt",
    GT_OR_EQ = "$gte",
    LT = "$lt",
    LT_OR_EQ = "$lte",
    IN = "$in",
    NOT_IN = "$notIn",
    LIKE = "$like",
    NOT_LIKE = "$notLike",
    ILIKE = "$iLike",
    NOT_ILIKE = "$notIlike",
    IS_NULL = "$isNull",
    IS_NOT_NULL = "$isNotNull",
    BETWEEN = "$between",
    NOT_BETWEEN = "$notBetween",
    NULL = "$null",
    NOT_NULL = "$notNull",
    IS_TRUE = "$isTrue",
    IS_FALSE = "$isFalse"
}
export declare enum OrderDirectionEnum {
    ASC = "ASC",
    DESC = "DESC"
}
export interface Relation {
    relation: string;
    select?: string[];
    where?: Record<string, any>;
}
