import { ArgumentsHost } from '@nestjs/common';
import {
    CUSTOM_ROUTE_ARGS_METADATA,
    INTERCEPTORS_METADATA,
    METHOD_METADATA,
    PARAMTYPES_METADATA,
    PATH_METADATA,
    ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';

import {
    CRUD_OPTIONS_METADATA,
    ACTION_NAME_METADATA,
    PARSED_CRUD_REQUEST_KEY,
    PARSED_BODY_METADATA,
    OVERRIDE_METHOD_METADATA,
    CRUD_AUTH_OPTIONS_METADATA,
} from '../constants';
import { BaseRouteName, CrudOptions } from '../interface/crud';
import { BaseRoute, CrudActionsEnum } from '../interface/crud';
import { isFunction } from '../utils';


export class R {

    static set(metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol) {
        if (!target) {
            return;
        }

        if (propertyKey) {
            Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
        } else {
            Reflect.defineMetadata(metadataKey, metadataValue, target);
        }
    }

    static get<T>(metadataKey: any, target: any, propertyKey?: string | symbol): T {
        return propertyKey
            ? Reflect.getMetadata(metadataKey, target, propertyKey)
            : Reflect.getMetadata(metadataKey, target);
    }

    static createCustomRouteArg(
        paramType: string,
        index: number,
        /* istanbul ignore next */
        pipes: any[] = [],
        data = undefined,
    ): any {
        return {
            [`${paramType}${CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
                index,
                factory: (_: any, ctx: any) => R.getContextRequest(ctx)[paramType],
                data,
                pipes,
            },
        };
    }

    static createRouteArg(
        paramType: RouteParamtypes,
        index: number,
        /* istanbul ignore next */
        pipes: any[] = [],
        data: any = undefined,
    ): any {
        return {
            [`${paramType}:${index}`]: {
                index,
                pipes,
                data,
            },
        };
    }

    static setDecorators(decorators: (PropertyDecorator | MethodDecorator)[], target: any, name: string) {
        // this makes metadata decorator works
        const decoratedDescriptor = Reflect.decorate(
            decorators,
            target,
            name,
            Reflect.getOwnPropertyDescriptor(target, name),
        );

        // this makes proxy decorator works
        Reflect.defineProperty(target, name, decoratedDescriptor);
    }

    static setParsedRequestArg(index: number) {
        return R.createCustomRouteArg(PARSED_CRUD_REQUEST_KEY, index);
    }


    static setQueryArg(index: number, /* istanbul ignore next */ pipes: any[] = []) {
        return R.createRouteArg(RouteParamtypes.QUERY, index, pipes);
    }

    static setParamsArg(name: string, index: number, /* istanbul ignore next */ pipes: any[] = []) {
        return R.createRouteArg(RouteParamtypes.PARAM, index, pipes, name);
    }

    static setBodyArg(index: number, /* istanbul ignore next */ pipes: any[] = []) {
        return R.createRouteArg(RouteParamtypes.BODY, index, pipes);
    }

    static setCrudOptions(options: CrudOptions, target: any) {
        R.set(CRUD_OPTIONS_METADATA, options, target);
    }

    static setRoute(route: BaseRoute, target: any) {
        if (!target) {
            return;
        }

        const { path, method } = route;

        // Ensure target is an object before setting metadata
        if (typeof target === 'function' || (typeof target === 'object' && target !== null)) {
            R.set(PATH_METADATA, path, target);
            R.set(METHOD_METADATA, method, target);
        }
    }

    static setInterceptors(interceptors: any[], func: unknown) {
        R.set(INTERCEPTORS_METADATA, interceptors, func);
    }

    static setRouteArgs(metadata: any, target: any, name: string) {
        R.set(ROUTE_ARGS_METADATA, metadata, target, name);
    }

    static setRouteArgsTypes(metadata: any, target: any, name: string) {
        R.set(PARAMTYPES_METADATA, metadata, target, name);
    }

    static setAction(action: CrudActionsEnum, func: unknown) {
        R.set(ACTION_NAME_METADATA, action, func);
    }

    static setCrudAuthOptions(metadata: any, target: any) {
        R.set(CRUD_AUTH_OPTIONS_METADATA, metadata, target);
    }


    static getCrudOptions(target: any): CrudOptions {
        return R.get(CRUD_OPTIONS_METADATA, target);
    }

    static getAction(func: unknown): CrudActionsEnum {
        return R.get(ACTION_NAME_METADATA, func);
    }

    static getOverrideRoute(func: unknown): BaseRouteName {
        return R.get(OVERRIDE_METHOD_METADATA, func);
    }

    static getInterceptors(func: unknown): any[] {
        return R.get(INTERCEPTORS_METADATA, func) || [];
    }

    static getRouteArgs(target: any, name: string): any {
        return R.get(ROUTE_ARGS_METADATA, target, name);
    }

    static getRouteArgsTypes(target: any, name: string): any[] {
        return R.get(PARAMTYPES_METADATA, target, name) || /* istanbul ignore next */[];
    }

    static getParsedBody(func: unknown): any {
        return R.get(PARSED_BODY_METADATA, func);
    }

    static getContextRequest(ctx: ArgumentsHost): any {
        return isFunction(ctx.switchToHttp) ? ctx.switchToHttp().getRequest() : /* istanbul ignore next */ ctx;
    }

}
