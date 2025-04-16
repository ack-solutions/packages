import deepmerge from 'deepmerge';

import { CrudOptions } from '../interface/crud';


export class CrudConfigService {

    static config: Partial<CrudOptions> = {
        routes: {
            findMany: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            findOne: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            counts: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            create: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            createMany: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            update: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            delete: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            deleteMany: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            deleteFromTrash: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            restore: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
            reorder: {
                enabled: true,
                interceptors: [],
                decorators: [],
            },
        },
    };

    static load(config: Partial<CrudOptions> = {}) {
        CrudConfigService.config = deepmerge(
            CrudConfigService.config,
            config,
            { arrayMerge: (_a, b, _c) => b },
        );
    }

}
