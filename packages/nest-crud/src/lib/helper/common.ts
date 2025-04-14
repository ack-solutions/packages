import { CrudRoutesOptions, RouteOptions } from '../interface/crud';


export function parseRouteOptions(routes: CrudRoutesOptions) {
    const parsedRoutes: Record<string, RouteOptions> = {};

    for (const [key, value] of Object.entries(routes)) {
        if (typeof value === 'boolean') {
            parsedRoutes[key] = {
                enabled: value,
                guards: [],
                interceptors: [],
            };
        } else if (typeof value === 'object') {
            parsedRoutes[key] = {
                enabled: true,
                guards: value?.guards || [],
                interceptors: value?.interceptors || [],
                ...value,
            };
        }
    }

    return parsedRoutes;
}

export function isBoolean(value: any) {
    const booleanValues = [
        'true',
        'false',
        true,
        false,
        'TRUE',
        'FALSE',
    ];
    return booleanValues.includes(value);
}
