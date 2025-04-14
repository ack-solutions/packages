import { HttpStatus } from '@nestjs/common';
import swagger from '@nestjs/swagger';
import swaggerConst from '@nestjs/swagger/dist/constants';

import { R } from './reflection.helper';
import { BaseRouteName, CrudOptions } from '../interface/crud';
import { isString, objKeys } from '../utils';


const pluralize = require('pluralize');


export class Swagger {

    static operationsMap(modelName: string): { [key in BaseRouteName]: string } {
        return {
            findMany: `Retrieve multiple ${pluralize(modelName)}`,
            findOne: `Retrieve a single ${modelName}`,
            create: `Create a single ${modelName}`,
            createMany: `Create multiple ${pluralize(modelName)}`,
            update: `Update a single ${modelName}`,
            updateMany: `Update multiple ${pluralize(modelName)}`,
            delete: `Delete a single ${modelName}`,
            deleteMany: `Delete multiple ${pluralize(modelName)}`,
            deleteFromTrash: `Delete a single ${modelName} from trash`,
            deleteFromTrashMany: `Delete multiple ${pluralize(modelName)} from trash`,
            restore: `Restore a single ${modelName}`,
            restoreMany: `Restore multiple ${pluralize(modelName)}`,
            reorder: `Reorder ${pluralize(modelName)}`,
        };
    }

    static setOperation(metadata: unknown, func: any): void {
        /* istanbul ignore else */
        if (swaggerConst) {
            R.set(swaggerConst.DECORATORS.API_OPERATION, metadata, func);
        }
    }

    static setParams(metadata: unknown, func: any): void {
        /* istanbul ignore else */
        if (swaggerConst) {
            R.set(swaggerConst.DECORATORS.API_PARAMETERS, metadata, func);
        }
    }

    static setExtraModels(swaggerModels: any): void {
        /* istanbul ignore else */
        if (swaggerConst) {
            const meta = Swagger.getExtraModels(swaggerModels.get);
            const models: any[] = [
                ...meta,
                ...objKeys(swaggerModels)
                    .map((name) => swaggerModels[name])
                    .filter((one) => one && one.name !== swaggerModels.get.name),
            ];
            R.set(swaggerConst.DECORATORS.API_EXTRA_MODELS, models, swaggerModels.get);
        }
    }

    static setResponseOk(metadata: unknown, func: any): void {
        /* istanbul ignore else */
        if (swaggerConst) {
            R.set(swaggerConst.DECORATORS.API_RESPONSE, metadata, func);
        }
    }

    static getOperation(func: any): any {
        /* istanbul ignore next */
        return swaggerConst ? R.get(swaggerConst.DECORATORS.API_OPERATION, func) || {} : {};
    }

    static getParams(func: any): any[] {
        /* istanbul ignore next */
        return swaggerConst ? R.get(swaggerConst.DECORATORS.API_PARAMETERS, func) || [] : [];
    }

    static getExtraModels(target: unknown): any[] {
        /* istanbul ignore next */
        return swaggerConst ? R.get(swaggerConst.DECORATORS.API_EXTRA_MODELS, target) || [] : [];
    }

    static getResponseOk(func: any): any {
        /* istanbul ignore next */
        return swaggerConst ? R.get(swaggerConst.DECORATORS.API_RESPONSE, func) || {} : {};
    }

    static createResponseMeta(name: BaseRouteName, swaggerModels: any): any {
        /* istanbul ignore else */
        if (swagger) {
            switch (name) {
                case 'findOne':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Find one base response',
                            type: swaggerModels.findOne,
                        },
                    };
                case 'findMany':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Find many base response',
                            type: swaggerModels.findMany,
                        },
                    };
                case 'create':
                    return {
                        [HttpStatus.CREATED]: {
                            description: 'Create one base response',
                            schema: { $ref: swagger.getSchemaPath(swaggerModels.create.name) },
                        },
                    };
                case 'createMany':
                    return {
                        [HttpStatus.CREATED]: {
                            description: 'Create many base response',
                            schema: {
                                type: 'array',
                                items: { $ref: swagger.getSchemaPath(swaggerModels.create.name) },
                            },
                        },
                    };
                case 'update':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Update one base response',
                            schema: { $ref: swagger.getSchemaPath(swaggerModels.update.name) },
                        },
                    };
                case 'updateMany':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Update many base response',
                            schema: {
                                type: 'array',
                                items: { $ref: swagger.getSchemaPath(swaggerModels.update.name) },
                            },
                        },
                    };

                case 'delete':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Delete one base response',
                        },
                    };

                case 'deleteMany':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Delete many base response',
                        },
                    };
                case 'deleteFromTrash':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Delete from trash base response',
                        },
                    };
                case 'deleteFromTrashMany':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Delete from trash many base response',
                        },
                    };
                case 'restore':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Restore one base response',
                        },
                    };
                case 'restoreMany':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Restore many base response',
                        },
                    };
                case 'reorder':
                    return {
                        [HttpStatus.OK]: {
                            description: 'Reorder base response',
                        },
                    };

                default:
                    return {
                        [HttpStatus.OK]: {
                            description: 'Success response',
                        },
                    };
            }
        } else {
            return {};
        }
    }

    static createPathParamsMeta(options: any): any[] {
        return swaggerConst
            ? objKeys(options).map((param: any) => ({
                name: param,
                required: true,
                in: 'path',
                type: options[param].type === 'number' ? Number : String,
                enum: options[param].enum ? Object.values(options[param].enum) : undefined,
            }))
            : /* istanbul ignore next */[];
    }

    static createQueryParamsMeta(name: BaseRouteName, options: CrudOptions) {
        /* istanbul ignore if */
        if (!swaggerConst) {
            return [];
        }

        const {
            fields,
            search,
            filter,
            or,
            join,
            sort,
            limit,
            offset,
            page,
            cache,
            includeDeleted,
        } = Swagger.getQueryParamsNames();

        const docsLink = (a: string) => `<a href="https://github.com/nestjsx/crud/wiki/Requests#${a}" target="_blank">Docs</a>`;

        const fieldsMetaBase = {
            name: fields,
            description: `Selects resource fields. ${docsLink('select')}`,
            required: false,
            in: 'query',
        };
        const fieldsMeta = {
            ...fieldsMetaBase,
            schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            style: 'form',
            explode: false,
        };

        const searchMetaBase = {
            name: search,
            description: `Adds search condition. ${docsLink('search')}`,
            required: false,
            in: 'query',
        };
        const searchMeta = {
            ...searchMetaBase,
            schema: { type: 'string' },
        };

        const filterMetaBase = {
            name: filter,
            description: `Adds filter condition. ${docsLink('filter')}`,
            required: false,
            in: 'query',
        };
        const filterMeta = {
            ...filterMetaBase,
            schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            style: 'form',
            explode: true,
        };

        const orMetaBase = {
            name: or,
            description: `Adds OR condition. ${docsLink('or')}`,
            required: false,
            in: 'query',
        };
        const orMeta = {
            ...orMetaBase,
            schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            style: 'form',
            explode: true,
        };

        const sortMetaBase = {
            name: sort,
            description: `Adds sort by field. ${docsLink('sort')}`,
            required: false,
            in: 'query',
        };
        const sortMeta = {
            ...sortMetaBase,
            schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            style: 'form',
            explode: true,
        };

        const joinMetaBase = {
            name: join,
            description: `Adds relational resources. ${docsLink('join')}`,
            required: false,
            in: 'query',
        };
        const joinMeta = {
            ...joinMetaBase,
            schema: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            style: 'form',
            explode: true,
        };

        const limitMetaBase = {
            name: limit,
            description: `Limit amount of resources. ${docsLink('limit')}`,
            required: false,
            in: 'query',
        };
        const limitMeta = {
            ...limitMetaBase,
            schema: { type: 'integer' },
        };

        const offsetMetaBase = {
            name: offset,
            description: `Offset amount of resources. ${docsLink('offset')}`,
            required: false,
            in: 'query',
        };
        const offsetMeta = {
            ...offsetMetaBase,
            schema: { type: 'integer' },
        };

        const pageMetaBase = {
            name: page,
            description: `Page portion of resources. ${docsLink('page')}`,
            required: false,
            in: 'query',
        };
        const pageMeta = {
            ...pageMetaBase,
            schema: { type: 'integer' },
        };

        const cacheMetaBase = {
            name: cache,
            description: `Reset cache (if was enabled). ${docsLink('cache')}`,
            required: false,
            in: 'query',
        };
        const cacheMeta = {
            ...cacheMetaBase,
            schema: {
                type: 'integer',
                minimum: 0,
                maximum: 1,
            },
        };

        const includeDeletedMetaBase = {
            name: includeDeleted,
            description: `Include deleted. ${docsLink('includeDeleted')}`,
            required: false,
            in: 'query',
        };
        const includeDeletedMeta = {
            ...includeDeletedMetaBase,
            schema: {
                type: 'integer',
                minimum: 0,
                maximum: 1,
            },
        };

        switch (name) {
            case 'findMany':
                return options.softDelete
                    ? [
                        fieldsMeta,
                        searchMeta,
                        filterMeta,
                        orMeta,
                        sortMeta,
                        joinMeta,
                        limitMeta,
                        offsetMeta,
                        pageMeta,
                        cacheMeta,
                        includeDeletedMeta,
                    ]
                    : [
                        fieldsMeta,
                        searchMeta,
                        filterMeta,
                        orMeta,
                        sortMeta,
                        joinMeta,
                        limitMeta,
                        offsetMeta,
                        pageMeta,
                        cacheMeta,
                    ];
            case 'findOne':
                return options.softDelete
                    ? [
                        fieldsMeta,
                        joinMeta,
                        cacheMeta,
                        includeDeletedMeta,
                    ]
                    : [
                        fieldsMeta,
                        joinMeta,
                        cacheMeta,
                    ];
            default:
                return [];
        }
    }

    static getQueryParamsNames(): any {
        const name = (n: string) => {
            return isString(n) ? n : n[0];
        };

        return {
            fields: name('fields'),
            search: name('search'),
            filter: name('filter'),
            or: name('or'),
            join: name('join'),
            sort: name('sort'),
            limit: name('limit'),
            offset: name('offset'),
            page: name('page'),
            cache: name('cache'),
            includeDeleted: name('includeDeleted'),
        };
    }

}

export function ApiProperty(options?: any): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        if (swagger) {
            const ApiPropertyDecorator = swagger.ApiProperty;
            ApiPropertyDecorator(options)(target, propertyKey);
        }
    };
}
