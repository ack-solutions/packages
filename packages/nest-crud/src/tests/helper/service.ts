import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

import { ID } from '../../lib/interface/typeorm';


export class TestService {


    findOne(id: ID, _options: FindOneOptions) {
        if (id === '1') {
            return {
                id: '1',
                name: 'Test Entity 1',
            };
        }
        return null;
    }

    find(_query: FindManyOptions<any>) {
        return [
            {
                id: '1',
                name: 'Test Entity 1',
            },
        ];
    }

    create(dto: any) {
        return {
            id: Math.floor(Math.random() * 1000),
            ...dto,
        };
    }

    createMany(input: any) {
        return input.bulk.map((dto: any) => ({
            id: Math.floor(Math.random() * 1000),
            ...dto,
        }));
    }


    update(id: ID, dto: any) {
        return {
            id,
            ...dto,
        };
    }

    updateMany(input: any) {
        return input.bulk.map((dto: any) => ({
            id: Math.floor(Math.random() * 1000),
            ...dto,
        }));
    }


    delete(_id: ID) {
        return {
            success: 'Successfully deleted',
        };
    }

    deleteMany(_ids: FindOptionsWhere<any>) {
        return {
            success: 'Successfully deleted',
        };
    }

    deleteFromTrash(_id: ID) {
        return {
            success: 'Successfully deleted from trash',
        };
    }

    restore(_id: number) {
        return {
            success: 'Successfully restored',
        };
    }

    reorder(_ids: ID[]) {
        return {
            success: 'Successfully reordered',
        };
    }


}
