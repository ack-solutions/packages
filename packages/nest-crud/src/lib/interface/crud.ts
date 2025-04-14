import { NestInterceptor, RequestMethod, ValidationPipeOptions } from '@nestjs/common';


export type BaseRouteName =
    | 'findMany'
    | 'findOne'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'delete'
    | 'deleteMany'
    | 'deleteFromTrash'
    | 'deleteFromTrashMany'
    | 'restore'
    | 'restoreMany'
    | 'reorder';


export interface BaseRoute {
    name: BaseRouteName;
    path: string;
    method: RequestMethod;
    enable: boolean;
    override: boolean;
}


export interface RouteOptions {
    enabled?: boolean;
    guards?: any[];
    interceptors?: Array<((...args: any[]) => any) | NestInterceptor<any, any>>;
    decorators?: any[];
}


export interface CrudRoutesOptions {
    findMany?: RouteOptions | false;
    findOne?: RouteOptions | false;
    create?: RouteOptions | false;
    createMany?: RouteOptions | false;
    update?: RouteOptions | false;
    updateMany?: RouteOptions | false;
    delete?: RouteOptions | false;
    deleteMany?: RouteOptions | false;
    deleteFromTrash?: RouteOptions | false;
    deleteFromTrashMany?: RouteOptions | false;
    restore?: RouteOptions | false;
    restoreMany?: RouteOptions | false;
    reorder?: RouteOptions | false;
}

export interface CrudQueryOptions {
    relations?: string[];
}

export interface CrudOptions {
    name: string;
    path?: string;
    query?: CrudQueryOptions;
    entity: any;
    routes?: CrudRoutesOptions;
    softDelete?: boolean;
    validation?: ValidationPipeOptions;
    dto?: {
        create?: any;
        update?: any;
    };
    interceptors?: Array<((...args: any[]) => any) | NestInterceptor<any, any>>;
    guards?: any[];
}

export interface PaginationResponse<T> {
    items: T[];
    total: number;
}

export enum CrudValidationGroupsEnum {
    CREATE = 'create',
    UPDATE = 'update',
}

export enum CrudActionsEnum {
    FIND_MANY = 'findMany',
    FIND_ONE = 'findOne',
    CREATE = 'create',
    CREATE_MANY = 'createMany',
    UPDATE = 'update',
    UPDATE_MANY = 'updateMany',
    DELETE = 'delete',
    DELETE_MANY = 'deleteMany',
    DELETE_FROM_TRASH = 'deleteFromTrash',
    DELETE_FROM_TRASH_MANY = 'deleteFromTrashMany',
    RESTORE = 'restore',
    RESTORE_MANY = 'restoreMany',
    REORDER = 'reorder',
}

export interface IFindManyOptions {
    relations?: string[];
    skip?: number;
    take?: number;
    order?: Record<string, 'ASC' | 'DESC'>;
    where?: Record<string, any>;
    select?: Record<string, any>;
    onlyDeleted?: boolean;
}

export interface IFindOneOptions {
    relations?: string[];
    select?: Record<string, any>;
}
