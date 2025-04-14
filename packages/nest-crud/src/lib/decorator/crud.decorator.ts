import { Controller } from '@nestjs/common';

import { CrudRoutesFactory } from '../crud/crud-routes.factory';
import { CrudOptions } from '../interface/crud';


export const Crud = (options: CrudOptions) => (target: any): void => {
    Controller(options.path || options.name)(target);
    CrudRoutesFactory.create(target, options);
};
