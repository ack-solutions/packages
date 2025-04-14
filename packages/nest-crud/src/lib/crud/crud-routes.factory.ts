import { RequestMethod, UseGuards } from '@nestjs/common';
import deepmerge from 'deepmerge';

import {
    isArrayFull,
    isObjectFull,
    isFunction,
    isIn,
    checkService,
} from '../utils';
import { R } from './reflection.helper';
import { SerializeHelper } from './serialize.helper';
import { Swagger } from './swagger.helper';
import { Validation } from './validation.helper';
import { BaseRoute, BaseRouteName, CrudActionsEnum, CrudOptions, CrudRoutesOptions, CrudValidationGroupsEnum } from '../interface/crud';
import { ID } from '../interface/typeorm';
import { CrudConfigService } from '../service/crud-config.service';


export class CrudRoutesFactory {

    protected options: CrudOptions;

    protected swaggerModels: any = {};

    constructor(protected target: any, options: CrudOptions) {
        this.options = options;
        this.create();
    }

    /* istanbul ignore next */
    static create(target: any, options: CrudOptions): CrudRoutesFactory {
        return new CrudRoutesFactory(target, options);
    }

    protected get targetProto(): any {
        return this.target.prototype;
    }

    protected get entityName(): string {
        return this.options.entity.name;
    }

    protected get entity(): any {
        return this.options.entity;
    }

    protected get actionsMap(): { [key in BaseRouteName]: CrudActionsEnum } {
        return {
            findMany: CrudActionsEnum.FIND_MANY,
            findOne: CrudActionsEnum.FIND_ONE,
            createMany: CrudActionsEnum.CREATE_MANY,
            create: CrudActionsEnum.CREATE,
            update: CrudActionsEnum.UPDATE,
            updateMany: CrudActionsEnum.UPDATE_MANY,
            delete: CrudActionsEnum.DELETE,
            deleteMany: CrudActionsEnum.DELETE_MANY,
            deleteFromTrash: CrudActionsEnum.DELETE_FROM_TRASH,
            deleteFromTrashMany: CrudActionsEnum.DELETE_FROM_TRASH_MANY,
            restore: CrudActionsEnum.RESTORE,
            restoreMany: CrudActionsEnum.RESTORE_MANY,
            reorder: CrudActionsEnum.REORDER,
        };
    }

    protected create() {
        const routesSchema = this.getRoutesSchema();
        this.mergeOptions();
        this.setResponseModels();
        this.createRoutes(routesSchema);
        this.enableRoutes(routesSchema);
    }

    protected mergeOptions() {
        // merge query config
        const query = isObjectFull(this.options.query) ? this.options.query : {};
        this.options.query = {
            ...CrudConfigService.config.query,
            ...query,
        };

        // merge routes config
        const routes = isObjectFull(this.options.routes) ? this.options.routes : {};
        this.options.routes = deepmerge(CrudConfigService.config.routes as CrudRoutesOptions, routes as CrudRoutesOptions, {
            arrayMerge: (_a, b, _c) => b,
        });


        // set dto
        if (!isObjectFull(this.options.dto)) {
            this.options.dto = {};
        }

        R.setCrudOptions(this.options, this.target);
    }

    protected getRoutesSchema(): BaseRoute[] {
        return [
            {
                name: 'findMany',
                path: '/',
                method: RequestMethod.GET,
                enable: true,
                override: false,
            },
            {
                name: 'findOne',
                path: '/:id',
                method: RequestMethod.GET,
                enable: true,
                override: false,
            },
            {
                name: 'create',
                path: '/',
                method: RequestMethod.POST,
                enable: true,
                override: false,
            },
            {
                name: 'createMany',
                path: '/bulk',
                method: RequestMethod.POST,
                enable: true,
                override: false,
            },
            {
                name: 'update',
                path: '/:id',
                method: RequestMethod.PUT,
                enable: true,
                override: false,
            },
            {
                name: 'updateMany',
                path: '/bulk',
                method: RequestMethod.PUT,
                enable: true,
                override: false,
            },
            {
                name: 'delete',
                path: '/:id',
                method: RequestMethod.DELETE,
                enable: true,
                override: false,
            },
            {
                name: 'deleteMany',
                path: '/delete/bulk',
                method: RequestMethod.DELETE,
                enable: true,
                override: false,
            },
            {
                name: 'deleteFromTrash',
                path: '/:id/trash',
                method: RequestMethod.DELETE,
                enable: true,
                override: false,
            },
            {
                name: 'deleteFromTrashMany',
                path: '/trash/bulk',
                method: RequestMethod.DELETE,
                enable: true,
                override: false,
            },
            {
                name: 'restore',
                path: '/:id/restore',
                method: RequestMethod.PUT,
                enable: true,
                override: false,
            },
            {
                name: 'restoreMany',
                path: '/restore/bulk',
                method: RequestMethod.PUT,
                enable: true,
                override: false,
            },
            {
                name: 'reorder',
                path: '/reorder',
                method: RequestMethod.PUT,
                enable: true,
                override: false,
            },
        ];
    }


    protected findManyHandler(name: BaseRouteName) {
        this.targetProto[name] = function findMany(req: any) {
            checkService(this);
            return this.service.findMany(req);
        };
    }

    protected findOneHandler(name: BaseRouteName) {
        this.targetProto[name] = function findOne(id: ID, ...others: any[]) {
            checkService(this);
            return this.service.findOne(id, ...others);
        };
    }

    protected createHandler(name: BaseRouteName) {
        this.targetProto[name] = function create(dto: any) {
            checkService(this);
            return this.service.create(dto);
        };
    }

    protected createManyHandler(name: BaseRouteName) {
        this.targetProto[name] = function createMany(dto: any) {
            checkService(this);
            return this.service.createMany(dto);
        };
    }

    protected updateHandler(name: BaseRouteName) {
        this.targetProto[name] = function update(id: ID, dto: any) {
            checkService(this);
            return this.service.update(id, dto);
        };
    }
    protected updateManyHandler(name: BaseRouteName) {
        this.targetProto[name] = function updateMany(dto: any) {
            checkService(this);
            return this.service.updateMany(dto);
        };
    }


    protected deleteHandler(name: BaseRouteName) {
        this.targetProto[name] = function deleteOne(id: ID) {
            checkService(this);
            return this.service.delete(id);
        };
    }

    protected deleteManyHandler(name: BaseRouteName) {
        this.targetProto[name] = function deleteMany(dto: any) {
            checkService(this);
            return this.service.deleteMany(dto);
        };
    }

    protected deleteFromTrashHandler(name: BaseRouteName) {
        this.targetProto[name] = function deleteFromTrash(id: ID) {
            checkService(this);
            return this.service.deleteFromTrash(id);
        };
    }

    protected deleteFromTrashManyHandler(name: BaseRouteName) {
        this.targetProto[name] = function deleteFromTrashMany(dto: any) {
            checkService(this);
            return this.service.deleteFromTrashMany(dto);
        };
    }

    protected restoreHandler(name: BaseRouteName) {
        this.targetProto[name] = function restore(id: ID) {
            checkService(this);
            return this.service.restore(id);
        };
    }

    protected restoreManyHandler(name: BaseRouteName) {
        this.targetProto[name] = function restoreMany(dto: any) {
            checkService(this);
            return this.service.restoreMany(dto);
        };
    }

    protected reorderHandler(name: BaseRouteName) {
        this.targetProto[name] = function reorder(dto: any) {
            checkService(this);
            return this.service.reorder(dto);
        };
    }

    protected canCreateRoute(name: BaseRouteName) {
        const routes = this.options.routes;

        // include recover route only for models with soft delete option
        if ((name === 'restore' || name === 'deleteFromTrash' || name === 'restoreMany' || name === 'deleteFromTrashMany') && this.options.softDelete !== true) {
            return false;
        }

        if (routes && routes[name]) {
            return routes[name].enabled === true;
        }

        return true;
    }

    protected setResponseModels() {
        const modelType = isFunction(this.entity)
            ? this.entity
            : SerializeHelper.createFindOneResponseDto(this.entityName);


        this.swaggerModels.findMany = SerializeHelper.createFindManyResponseDto(modelType, this.entityName);
        this.swaggerModels.findOne = SerializeHelper.createFindOneResponseDto(this.entityName);
        this.swaggerModels.create = modelType;
        this.swaggerModels.createMany = SerializeHelper.createCreateManyResponseDto(modelType, this.entityName);
        this.swaggerModels.update = modelType;
        this.swaggerModels.updateMany = SerializeHelper.createUpdateManyResponseDto(modelType, this.entityName);
        this.swaggerModels.delete = SerializeHelper.createSuccessResponseDto(this.entityName);
        this.swaggerModels.deleteMany = SerializeHelper.createSuccessResponseDto(this.entityName);
        this.swaggerModels.deleteFromTrash = SerializeHelper.createSuccessResponseDto(this.entityName);
        this.swaggerModels.deleteFromTrashMany = SerializeHelper.createSuccessResponseDto(this.entityName);
        this.swaggerModels.restore = SerializeHelper.createSuccessResponseDto(this.entityName);
        this.swaggerModels.restoreMany = SerializeHelper.createSuccessResponseDto(this.entityName);
        this.swaggerModels.reorder = SerializeHelper.createSuccessResponseDto(this.entityName);

        Swagger.setExtraModels(this.swaggerModels);
    }

    protected createRoutes(routesSchema: BaseRoute[]) {
        routesSchema.forEach((route) => {
            if (this.canCreateRoute(route.name)) {
                // Create handler method
                this[`${route.name}Handler`](route.name);

                // Only set metadata if method was created
                if (this.targetProto[route.name]) {
                    this.setBaseRouteMeta(route.name);
                }
            }
        });
    }


    protected enableRoutes(routesSchema: BaseRoute[]) {
        routesSchema.forEach((route) => {
            if (route.enable && this.targetProto[route.name]) {
                // Ensure method exists before setting route metadata
                const method = this.targetProto[route.name];
                if (typeof method === 'function') {
                    R.setRoute(route, method);
                }
            }
        });
    }


    protected setBaseRouteMeta(name: BaseRouteName) {
        this.setRouteArgs(name);
        this.setRouteArgsTypes(name);
        this.setInterceptors(name);
        this.setAction(name);
        this.setSwaggerOperation(name);
        this.setSwaggerPathParams(name);
        this.setSwaggerQueryParams(name);
        this.setSwaggerResponseOk(name);
        // set decorators after Swagger so metadata can be overwritten
        this.setDecorators(name);
        this.setGuards(name);
    }

    protected setRouteArgs(name: BaseRouteName) {
        let args = {};

        switch (name) {
            case 'findMany':
                args = {
                    ...R.setQueryArg(0),
                };
                break;

            case 'findOne':
                args = {
                    ...R.setParamsArg('id', 0),
                    ...R.setQueryArg(1),
                };
                break;

            case 'create':
                args = {
                    ...R.setBodyArg(0, [Validation.getValidationPipe(this.options.validation, CrudValidationGroupsEnum.CREATE)]),
                };
                break;

            case 'createMany':
                args = {
                    ...R.setBodyArg(0, [Validation.getValidationPipe(this.options.validation, CrudValidationGroupsEnum.CREATE)]),
                };
                break;

            case 'update':
                args = {
                    ...R.setParamsArg('id', 0),
                    ...R.setBodyArg(1, [Validation.getValidationPipe(this.options.validation, CrudValidationGroupsEnum.UPDATE)]),
                };
                break;

            case 'updateMany':
                args = {
                    ...R.setBodyArg(0, [Validation.getValidationPipe(this.options.validation, CrudValidationGroupsEnum.UPDATE)]),
                };
                break;

            case 'delete':
                args = {
                    ...R.setParamsArg('id', 0),
                };
                break;

            case 'deleteMany':
                args = {
                    ...R.setQueryArg(0),
                };
                break;

            case 'deleteFromTrash':
                args = {
                    ...R.setParamsArg('id', 0),
                };
                break;

            case 'deleteFromTrashMany':
                args = {
                    ...R.setQueryArg(0),
                };
                break;

            case 'restore':
                args = {
                    ...R.setParamsArg('id', 0),
                };
                break;

            case 'restoreMany':
                args = {
                    ...R.setBodyArg(0),
                };
                break;

            case 'reorder':
                args = {
                    ...R.setBodyArg(0, [Validation.getValidationPipe(this.options.validation, CrudValidationGroupsEnum.UPDATE)]),
                };
                break;
            default:
        }

        R.setRouteArgs(args, this.target, name);
    }

    protected setRouteArgsTypes(name: BaseRouteName) {
        switch (name) {
            case 'findMany': {
                const findManyDto = Validation.createFindManyDto(this.options);
                R.setRouteArgsTypes([findManyDto], this.targetProto, name);
                break;
            }
            case 'findOne': {
                const findOneDto = Validation.createFindOneDto(this.options);
                R.setRouteArgsTypes([String, findOneDto], this.targetProto, name);
                break;
            }
            case 'create': {
                const createDto = this.options.dto?.create || this.entity;
                R.setRouteArgsTypes([createDto], this.targetProto, name);
                break;
            }
            case 'createMany': {
                const createManyDto = Validation.createBulkDto(this.options);
                R.setRouteArgsTypes([createManyDto], this.targetProto, name);
                break;
            }
            case 'update': {
                const updateDto = this.options.dto?.update || this.entity;
                R.setRouteArgsTypes([String, updateDto], this.targetProto, name);
                break;
            }
            case 'updateMany': {
                const updateManyDto = Validation.updateBulkDto(this.options);
                R.setRouteArgsTypes([updateManyDto], this.targetProto, name);
                break;
            }
            case 'delete':
                R.setRouteArgsTypes([String], this.targetProto, name);
                break;
            case 'deleteMany': {
                const deleteManyDto = Validation.createDeleteManyDto(this.options);
                R.setRouteArgsTypes([deleteManyDto], this.targetProto, name);
                break;
            }
            case 'deleteFromTrash':
                R.setRouteArgsTypes([String], this.targetProto, name);
                break;
            case 'deleteFromTrashMany': {
                const deleteFromTrashManyDto = Validation.createTrashDeleteManyDto(this.options);
                R.setRouteArgsTypes([deleteFromTrashManyDto], this.targetProto, name);
                break;
            }
            case 'restore':
                R.setRouteArgsTypes([String], this.targetProto, name);
                break;
            case 'restoreMany': {
                const restoreManyDto = Validation.createRestoreManyDto(this.options);
                R.setRouteArgsTypes([restoreManyDto], this.targetProto, name);
                break;
            }
            case 'reorder': {
                const reorderDto = Validation.createReorderDto(this.options);
                R.setRouteArgsTypes([reorderDto], this.targetProto, name);
                break;
            }
            default:
                R.setRouteArgsTypes([], this.targetProto, name);
                break;
        }
    }

    protected setInterceptors(name: BaseRouteName) {
        const interceptors = (this.options.routes?.[name] as any)?.interceptors;
        R.setInterceptors(
            [...(isArrayFull(interceptors) ? interceptors : [])],
            this.targetProto[name],
        );
    }

    protected setDecorators(name: BaseRouteName) {
        const decorators = (this.options.routes?.[name] as any)?.decorators;
        R.setDecorators(isArrayFull(decorators) ? decorators : [], this.targetProto, name);
    }

    protected setGuards(name: BaseRouteName) {
        let guards = (this.options?.routes?.[name] as any)?.guards || [];
        if (this.options?.guards && this.options.guards.length > 0) {
            guards = [...guards, ...this.options.guards];
        }
        if (guards && guards.length > 0) {
            R.setDecorators([UseGuards(...guards)], this.targetProto, name);
        }
    }

    protected setAction(name: BaseRouteName) {
        R.setAction(this.actionsMap[name], this.targetProto[name]);
    }

    protected setSwaggerOperation(name: BaseRouteName) {
        const summary = Swagger.operationsMap(this.entityName)[name];
        const operationId = name + this.targetProto.constructor.name + this.entityName;
        Swagger.setOperation({
            summary,
            operationId,
        }, this.targetProto[name]);
    }

    protected setSwaggerPathParams(name: BaseRouteName) {
        const metadata = Swagger.getParams(this.targetProto[name]);
        const withPrimary: BaseRouteName[] = [
            'findOne',
            'update',
            'delete',
            'deleteFromTrash',
            'restore',
        ];

        let params = {};

        if (isIn(name, withPrimary)) {
            params = {
                field: 'id',
                type: 'uuid',
                primary: true,
            };
        }

        const pathParamsMeta = Swagger.createPathParamsMeta(params);
        Swagger.setParams([...metadata, ...pathParamsMeta], this.targetProto[name]);
    }

    protected setSwaggerQueryParams(name: BaseRouteName) {
        const metadata = Swagger.getParams(this.targetProto[name]);
        const queryParamsMeta = Swagger.createQueryParamsMeta(name, this.options);
        Swagger.setParams([...metadata, ...queryParamsMeta], this.targetProto[name]);
    }

    protected setSwaggerResponseOk(name: BaseRouteName) {
        const metadata = Swagger.getResponseOk(this.targetProto[name]);
        const metadataToAdd =
            Swagger.createResponseMeta(name, this.swaggerModels) || /* istanbul ignore next */ {};
        Swagger.setResponseOk({
            ...metadata,
            ...metadataToAdd,
        }, this.targetProto[name]);
    }

    protected routeNameAction(name: BaseRouteName) {
        return name.split('Many')[0] as 'create' | 'update';
    }

}
