import { NotFoundException } from '@nestjs/common';
import { sumBy, uniq } from 'lodash';
import { FindOneOptions, FindOptionsWhere, In, Repository, SaveOptions } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';

import { BaseEntity } from '../base-entity';
import { FindQueryBuilder } from './find-query-builder';
import { PaginationResponse } from '../interface/crud';
import { ID } from '../interface/typeorm';


export class CrudService<T extends BaseEntity> {

    protected hasSoftDelete = true;

    constructor(readonly repository: Repository<T>) { }

    protected async beforeSave(entity: Partial<T>, _request?: any) {
        return entity;
    }
    protected async afterSave(newValue: T, _oldValue?: any, _request?: any) {
        return newValue;
    }

    protected async beforeCreate(entity: Partial<T>, _request?: any) {
        return entity;
    }

    protected async afterCreate(newValue: T, _oldValue?: any, _request?: any) {
        return newValue;
    }

    protected async beforeUpdate(entity: Partial<T>, _entityData?: T) {
        return entity;
    }

    protected async afterUpdate(newValue: T, _oldValue?: any, _request?: any) {
        return newValue;
    }


    protected async beforeFindMany(queryBuilder: FindQueryBuilder<T>) {
        return queryBuilder;
    }

    protected async beforeCounts(queryBuilder: FindQueryBuilder<T>) {
        return queryBuilder;
    }

    protected async beforeFindOne(options: FindOneOptions<T> = {}) {
        return options;
    }


    protected async beforeDelete(data: T) {
        return data;
    }

    protected async afterDelete(oldData: T) {
        return oldData;
    }

    protected async beforeDeleteMany(ids: ID[]) {
        return ids;
    }

    protected async afterDeleteMany(ids: ID[]) {
        return ids;
    }

    protected async beforeDeleteFromTrash(data: T) {
        return data;
    }

    protected async afterDeleteFromTrash(oldData: T) {
        return oldData;
    }

    protected async beforeDeleteFromTrashMany(ids: ID[]) {
        return ids;
    }

    protected async afterDeleteFromTrashMany(ids: ID[]) {
        return ids;
    }

    protected async beforeRestore(data: T) {
        return data;
    }

    protected async afterRestore(oldData: T) {
        return oldData;
    }

    protected async beforeRestoreMany(ids: ID[]) {
        return ids;
    }

    protected async afterRestoreMany(ids: ID[]) {
        return ids;
    }

    async create(data: Partial<T>, saveOptions: SaveOptions = {}, ..._others: any[]): Promise<T> {
        data = await this.beforeSave(data);
        data = await this.beforeCreate(data);
        let entity = this.repository.create(data as DeepPartial<T>);

        entity = await this.repository.save(entity, saveOptions);
        await this.afterSave(entity, null, data);
        await this.afterCreate(entity, null, data);
        return entity;
    }

    async createMany(
        data: { bulk: Partial<T>[] },
        saveOptions: SaveOptions = {},
        ..._others: any[]
    ): Promise<T[]> {
        return this.repository.manager.transaction(async (manager) => {
            let bulk = await Promise.all(
                data.bulk.map(item => this.beforeSave(item)),
            );

            bulk = await Promise.all(
                bulk.map(item => this.beforeCreate(item)),
            );

            const entities = manager.create(this.repository.target as any, bulk);

            const savedEntities = await manager.save<T>(entities as T[], saveOptions);

            for (let i = 0; i < savedEntities.length; i++) {
                await this.afterSave(savedEntities[i], null, data.bulk[i]);
                await this.afterCreate(savedEntities[i], null, data.bulk[i]);
            }

            return savedEntities;
        });
    }

    async findMany(query: any, ..._others: any[]): Promise<PaginationResponse<T>> {
        let queryBuilder = new FindQueryBuilder(this.repository, query);
        queryBuilder = await this.beforeFindMany(queryBuilder);
        const [items, total] = await queryBuilder.getManyAndCount();
        return {
            items,
            total,
        };
    }

    async counts(request: {
        filter: any,
        groupByKey?: string | string[],
    }): Promise<{ total: number, data?: Array<{ count: number } & Record<string, any>> }> {
        const { filter = {}, groupByKey = null } = request;

        let result: { total: number, data?: Array<{ count: number } & Record<string, any>> } = {
            total: 0,
        }

        let queryBuilder = new FindQueryBuilder(this.repository, filter);
        queryBuilder = await this.beforeCounts(queryBuilder);
        const query = queryBuilder.getQueryBuilder();

        // No groupByKey: return total count
        if (!groupByKey) {
            query.select(`COUNT("${query.alias}"."id")`, 'count');
            const response = await query.getRawOne() as { count: number };
            result.total = Number(response.count) || 0;
            return result;
        }

        // Normalize and validate groupByKey
        const groupKeys = Array.isArray(groupByKey) ? uniq(groupByKey) : [groupByKey];
        const validColumns = this.repository.metadata.columns.map(col => col.propertyName);
        const invalidKeys = groupKeys.filter(key => !validColumns.includes(key));

        if (invalidKeys.length) {
            throw new Error(`Invalid groupByKey: ${invalidKeys.join(', ')}. Valid columns are: ${validColumns.join(', ')}`);
        }

        // Add COUNT and groupings
        query.select(`COUNT("${query.alias}"."id")`, 'count');
        groupKeys.forEach(key => {
            query.addSelect(`"${query.alias}"."${key}"`, key);
            query.addGroupBy(`"${query.alias}"."${key}"`);
        });
        query.limit(1000);

        const response = await query.getRawMany() as Array<{ count: number } & Record<string, any>>;
        const total = sumBy(response, (item) => Number(item.count) || 0);

        result.total = total;
        result.data = response.map(item => ({
            count: Number(item.count) || 0,
            ...item,
        }));
        return result;
    }

    async findOne(id: ID, options: FindOneOptions<T> = {}, ..._others: any[]): Promise<T> {
        options = {
            ...options,
            where: {
                id: id as any,
                ...options?.where,
            },
        };
        options = await this.beforeFindOne(options);
        const result = await this.repository.findOne(options);
        if (result) {
            return result;
        }

        throw new NotFoundException(`${this.repository.metadata.name} not found`);
    }

    async update(criteria: ID | FindOptionsWhere<T>, data: Partial<T>, ..._others: any[]) {
        criteria = this.parseFindOptions(criteria);
        const oldData = await this.repository.findOne({ where: criteria });
        if (!oldData) {
            throw new NotFoundException(`${this.repository.metadata.name} not found`);
        }
        data = await this.beforeSave(data);
        data = await this.beforeUpdate(data, oldData);
        const entity = this.repository.create({
            ...data,
            id: oldData?.id,
        } as DeepPartial<T>);
        await this.repository.save(entity);

        const result = await this.repository.findOne({ where: criteria }) as T;

        await this.afterSave(result, oldData, data);
        await this.afterUpdate(result, oldData, data);
        return result;
    }

    async updateMany(
        data: { bulk: (Partial<T> & { id: ID })[] },
        ..._others: any[]
    ): Promise<T[]> {
        return this.repository.manager.transaction(async (manager) => {
            const results: T[] = [];

            for (const item of data.bulk) {
                const id = item.id;
                if (!id) continue;

                const criteria = this.parseFindOptions(id);

                const oldData = await manager.findOne(this.repository.target as any, {
                    where: criteria,
                });

                if (!oldData) continue;

                let newData = await this.beforeSave(item);
                newData = await this.beforeUpdate(newData);

                await manager.save(this.repository.create({
                    ...newData,
                    id: oldData?.id,
                } as DeepPartial<T>));

                const updated = await manager.findOne(this.repository.target as any, {
                    where: criteria,
                });

                if (updated) {
                    await this.afterSave(updated, oldData, newData);
                    await this.afterUpdate(updated, oldData, newData);
                    results.push(updated);
                }
            }

            return results;
        });
    }

    async delete(criteria: ID | FindOptionsWhere<T>, ...others: any) {
        console.log('crud service', { criteria, others })
        criteria = this.parseFindOptions(criteria);

        const oldData = await this.repository.findOne({ where: criteria });
        if (!oldData) {
            throw new NotFoundException(`${this.repository.metadata.name} with criteria ${JSON.stringify(criteria)} not found`);
        }
        const softDelete = !!others?.softDelete;

        await this.beforeDelete(oldData);

        if (softDelete) {
            await this.repository.softDelete(criteria);
        } else {
            await this.repository.delete(criteria);
        }

        await this.afterDelete(oldData);
        return {
            message: 'Successfully deleted',
        };
    }

    async deleteMany(params: { ids: ID[] }, ...others: any) {
        const ids = await this.beforeDeleteMany(params.ids);
        if (ids?.length > 0) {
            const softDelete = !!others?.softDelete;
            if (softDelete) {
                await this.repository.softDelete({ id: In(ids) as any });
            } else {
                await this.repository.delete({ id: In(ids) as any });
            }
            await this.afterDeleteMany(ids);
            return {
                message: 'Successfully deleted',
            };
        }
        return {
            message: 'No items to delete',
        };
    }

    async deleteFromTrash(criteria: ID | FindOptionsWhere<T>, ..._others: any[]) {
        criteria = this.parseFindOptions(criteria);

        const oldData = await this.repository.findOne({
            where: criteria,
            withDeleted: true,
        });

        if (!oldData) {
            throw new NotFoundException(`${this.repository.metadata.name} with criteria ${JSON.stringify(criteria)} not found`);
        }

        await this.beforeDeleteFromTrash(oldData);

        await this.repository.delete(criteria);
        await this.afterDeleteFromTrash(oldData);
        return {
            success: true,
            message: 'Successfully deleted',
        };
    }

    async deleteFromTrashMany(params: { ids: ID[] }, ..._others: any[]) {
        const ids = await this.beforeDeleteFromTrashMany(params.ids);
        if (ids?.length > 0) {
            await this.repository.delete({ id: In(ids) as any });
            await this.afterDeleteFromTrashMany(ids);
        }
        return {
            success: true,
            message: 'Successfully deleted',
        };
    }

    async restore(criteria: ID | FindOptionsWhere<T>, ..._others: any[]) {
        criteria = this.parseFindOptions(criteria);

        const oldData = await this.repository.findOne({
            where: criteria,
            withDeleted: true,
        });
        if (!oldData) {
            throw new NotFoundException(`${this.repository.metadata.name} with criteria ${JSON.stringify(criteria)} not found`);
        }

        await this.beforeRestore(oldData);

        await this.repository.restore(criteria);

        await this.afterRestore(oldData);
        return {
            success: true,
            message: 'Successfully restored',
        };
    }

    async restoreMany(params: { ids: ID[] }, ..._others: any[]) {
        const ids = await this.beforeRestoreMany(params.ids);
        if (ids?.length > 0) {
            await this.repository.restore({
                id: In(ids) as any,
            });
            await this.afterRestoreMany(ids);
        }
        return {
            success: true,
            message: 'Successfully restored',
        };
    }

    async reorder(order: ID[], ..._others: any[]) {
        for (let i = 0; i < order.length; i++) {
            await this.repository.update(order[i], { order: i } as any);
        }
    }

    protected parseFindOptions(criteria: ID | FindOptionsWhere<T>, ..._others: any[]) {
        if (typeof criteria === 'string' || typeof criteria === 'number') {
            criteria = { id: criteria } as any;
        }
        return criteria as FindOptionsWhere<T>;
    }

}
