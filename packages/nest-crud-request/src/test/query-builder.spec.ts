import { QueryBuilder } from '../lib/query-builder';
import { OrderDirectionEnum } from '../lib/types';


describe('QueryBuilder', () => {
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
        queryBuilder = new QueryBuilder({});
    });

    it('should set options', () => {
        const options = { select: ['name', 'age'] };
        queryBuilder.setOptions(options);
        expect(queryBuilder.toObject().select).toEqual(options.select);
    });

    it('should merge options shallowly', () => {
        queryBuilder.setOptions({ select: ['name'] });
        queryBuilder.mergeOptions({ select: ['age'] });
        expect(queryBuilder.toObject().select).toEqual(['age']);
    });

    it('should merge options deeply', () => {
        queryBuilder.setOptions({ where: { age: { $gt: 18 } } });
        queryBuilder.mergeOptions({ where: { name: { $eq: 'John' } } }, true);
        expect(queryBuilder.toObject().where).toEqual({
            age: { $gt: 18 },
            name: { $eq: 'John' },
        });
    });

    it('should add select fields', () => {
        queryBuilder.addSelect('name');
        queryBuilder.addSelect(['age', 'email']);
        expect(queryBuilder.toObject().select).toEqual([
            'name',
            'age',
            'email',
        ]);
    });

    it('should remove select fields', () => {
        queryBuilder.addSelect([
            'name',
            'age',
            'email',
        ]);
        queryBuilder.removeSelect('age');
        expect(queryBuilder.toObject().select).toEqual(['name', 'email']);
    });

    it('should add and remove relations as array of objects', () => {
        queryBuilder.addRelation('profile', ['id', 'bio']);
        queryBuilder.addRelation('posts', ['title', 'content']);

        const relations = queryBuilder.toObject().relations;
        expect(relations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    relation: 'profile',
                    select: ['id', 'bio'],
                }),
                expect.objectContaining({
                    relation: 'posts',
                    select: ['title', 'content'],
                }),
            ]),
        );

        queryBuilder.removeRelation('profile');
        const updatedRelations = queryBuilder.toObject().relations;
        expect(updatedRelations).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    relation: 'posts',
                    select: ['title', 'content'],
                }),
            ]),
        );
        expect(updatedRelations).not.toEqual(
            expect.arrayContaining([expect.objectContaining({ relation: 'profile' })]),
        );
    });

    it('should handle null or empty relations', () => {
        queryBuilder.addRelation('profile');
        expect(queryBuilder.toObject().relations).not.toEqual(undefined);

        queryBuilder.addRelation('profile');
        queryBuilder.removeRelation('profile');
        expect(queryBuilder.toObject().relations).toEqual(undefined);
    });

    it('should add and remove relations as array of strings', () => {
        queryBuilder.addRelation('profile');
        queryBuilder.addRelation('posts');

        const relations = queryBuilder.toObject().relations;
        expect(relations).toEqual(
            expect.arrayContaining([expect.objectContaining({ relation: 'profile' }), expect.objectContaining({ relation: 'posts' })]),
        );

        queryBuilder.removeRelation('profile');
        const updatedRelations = queryBuilder.toObject().relations;
        expect(updatedRelations).toEqual(
            expect.arrayContaining([expect.objectContaining({ relation: 'posts' })]),
        );
        expect(updatedRelations).not.toEqual(
            expect.arrayContaining([expect.objectContaining({ relation: 'profile' })]),
        );
    });

    it('should add where conditions', () => {
        queryBuilder.where('age', 25);
        expect(queryBuilder.toObject().where).toEqual({ age: { $eq: 25 } });
    });

    it('should handle empty where conditions', () => {
        queryBuilder.where(() => {
            // Do nothing
        });
        expect(queryBuilder.toObject().where).toEqual(undefined);
    });

    it('should add order', () => {
        queryBuilder.addOrder('name', OrderDirectionEnum.ASC);
        expect(queryBuilder.toObject().order).toEqual({ name: OrderDirectionEnum.ASC });
    });

    it('should remove order', () => {
        queryBuilder.addOrder('name', OrderDirectionEnum.ASC);
        queryBuilder.removeOrder('name');
        expect(queryBuilder.toObject().order).toEqual({});
    });

    it('should set skip and take', () => {
        queryBuilder.setSkip(10);
        queryBuilder.setTake(5);
        expect(queryBuilder.toObject().skip).toBe(10);
        expect(queryBuilder.toObject().take).toBe(5);
    });

    it('should convert to JSON', () => {
        queryBuilder.setOptions({ select: ['name'] });
        const json = queryBuilder.toJson();
        expect(json).toBe(JSON.stringify(queryBuilder.toObject()));
    });
});
