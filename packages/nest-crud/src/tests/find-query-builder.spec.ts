import { OrderDirectionEnum } from '@ackplus/nest-crud-request';
import { Repository } from 'typeorm';

import { TestDatabaseConfig } from './helper/database/database-config';
import { FindQueryBuilder } from '../lib/service/find-query-builder';
import { User } from './helper/database/entities/user-test.entity';


describe('FindQueryBuilder - Integration Tests', () => {
    let userRepository: Repository<User>;
    let queryBuilder: FindQueryBuilder<User>;

    beforeAll(async () => {
        const dataSource = await TestDatabaseConfig.createDataSource();
        userRepository = dataSource.getRepository(User);
    });

    beforeEach(async () => {
        await TestDatabaseConfig.cleanDatabase();
        await TestDatabaseConfig.seedDatabase();
    });

    afterAll(async () => {
        await TestDatabaseConfig.closeDatabase();
    });

    describe('Simple Queries', () => {
        it('should find by simple equality', async () => {
            const query = {
                where: {
                    status: 'active',
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
        });

        it('should find by comparison operators', async () => {
            const query = {
                where: {
                    'profile.age': { $gt: 27 },
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Jane Smith');
        });
    });

    describe('Nested Relations', () => {
        it('should query nested relations', async () => {
            const query = {
                where: {
                    'posts.status': 'published',
                    'profile.verified': true,
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
        });

        it('should handle deep nested conditions', async () => {
            const query = {
                where: {
                    $and: [
                        { 'profile.age': { $gt: 20 } },
                        {
                            $or: [{ 'posts.likes': { $gt: 15 } }, { 'posts.likes': { $lt: 10 } }],
                        },
                    ],
                },
            };

            const queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            // Verify the query structure
            const generatedQuery = queryBuilder.getQueryBuilder().getSql();
            expect(generatedQuery).toContain('LEFT JOIN "profiles" "profile"');
            expect(generatedQuery).toContain('LEFT JOIN "posts" "posts"');
            expect(generatedQuery).toContain('"profile"."age" > 20');
            expect(generatedQuery).toContain('"posts"."likes" > 15');
            expect(generatedQuery).toContain('"posts"."likes" < 10');

            // Verify the results
            expect(result).toHaveLength(2);
        });

        it('should handle simple nested conditions', async () => {
            const query = {
                where: {
                    'profile.age': { $gt: 25 },
                },
            };

            const queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            const generatedQuery = queryBuilder.getQueryBuilder().getSql();
            expect(generatedQuery).toContain('LEFT JOIN "profiles" "profile"');
            expect(generatedQuery).toContain('"profile"."age" > 25');

            expect(result).toHaveLength(1);
        });
    });

    describe('Array Operations', () => {
        it('should handle array contains', async () => {
            const query = {
                where: {
                    'posts.likes': { $contains: 10 },
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(2);
        });

        it('should handle IN operator', async () => {
            const query = {
                where: {
                    status: { $in: ['active', 'inactive'] },
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(2);
        });
    });

    describe('Complex Queries', () => {
        it('should handle complex nested conditions with multiple relations', async () => {
            const query = {
                where: {
                    $and: [
                        { status: 'active' },
                        {
                            $or: [{ 'posts.likes': { $gt: 7 } }, { 'profile.verified': true }],
                        },
                    ],
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
        });

        it('should handle all operators in a single query', async () => {
            const query = {
                where: {
                    $and: [
                        { status: { $in: ['active', 'inactive'] } },
                        { 'profile.age': { $between: [20, 35] } },
                        { 'posts.title': { $like: '%Post%' } },
                        {
                            $or: [{ 'posts.likes': { $gt: 5 } }, { 'profile.verified': { $isTrue: true } }],
                        },
                    ],
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            // Add more specific assertions
        });
    });

    describe('Query Performance', () => {
        it('should generate efficient SQL with proper joins', async () => {
            const query = {
                where: {
                    'posts.status': 'published',
                    'profile.verified': true,
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const sql = queryBuilder.getQueryBuilder().getSql();

            // Verify SQL structure
            expect(sql).toContain('LEFT JOIN');
            expect(sql).not.toContain('CROSS JOIN');
            // Add more SQL structure assertions
        });
    });

    describe('FindQueryBuilder - Pagination and Ordering', () => {
        beforeEach(async () => {
            await TestDatabaseConfig.cleanDatabase();
            // Seed with more test data for pagination testing
            await TestDatabaseConfig.seedDatabase([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    status: 'active',
                    profile: {
                        age: 30,
                        verified: true,
                    },
                },
                {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    status: 'active',
                    profile: {
                        age: 25,
                        verified: true,
                    },
                },
                {
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    status: 'inactive',
                    profile: {
                        age: 35,
                        verified: false,
                    },
                },
                {
                    name: 'Alice Brown',
                    email: 'alice@example.com',
                    status: 'active',
                    profile: {
                        age: 28,
                        verified: true,
                    },
                },
            ]);
        });

        describe('Order', () => {
            it('should order by single field ascending', async () => {
                const query = {
                    order: {
                        name: OrderDirectionEnum.ASC,
                    },
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(4);
                expect(result[0].name).toBe('Alice Brown');
                expect(result[1].name).toBe('Bob Johnson');
                expect(result[2].name).toBe('Jane Smith');
                expect(result[3].name).toBe('John Doe');
            });

            it('should order by single field descending', async () => {
                const query = {
                    order: {
                        name: OrderDirectionEnum.DESC,
                    },
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(4);
                expect(result[0].name).toBe('John Doe');
                expect(result[1].name).toBe('Jane Smith');
                expect(result[2].name).toBe('Bob Johnson');
                expect(result[3].name).toBe('Alice Brown');
            });

            it('should order by multiple fields', async () => {
                const query = {
                    order: {
                        status: OrderDirectionEnum.ASC,
                        name: OrderDirectionEnum.DESC,
                    },
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(4);
                // Should be ordered by status first (active before inactive)
                // Then by name in descending order within each status
                expect(result.map(user => ({
                    name: user.name,
                    status: user.status,
                }))).toEqual([
                    {
                        name: 'John Doe',
                        status: 'active',
                    },
                    {
                        name: 'Jane Smith',
                        status: 'active',
                    },
                    {
                        name: 'Alice Brown',
                        status: 'active',
                    },
                    {
                        name: 'Bob Johnson',
                        status: 'inactive',
                    },
                ]);
            });

            it('should order by nested relation field', async () => {
                const query = {
                    order: {
                        'profile.age': OrderDirectionEnum.DESC,
                    },
                    relations: ['profile'],
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(4);
                expect(result[0].profile.age).toBe(35);
                expect(result[3].profile.age).toBe(25);
            });
        });

        describe('Pagination', () => {
            it('should limit results with take', async () => {
                const query = {
                    take: 2,
                    order: { name: OrderDirectionEnum.ASC }, // Order to ensure consistent results
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Alice Brown');
                expect(result[1].name).toBe('Bob Johnson');
            });

            it('should skip results with offset', async () => {
                const query = {
                    skip: 2,
                    order: { name: OrderDirectionEnum.ASC }, // Order to ensure consistent results
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Jane Smith');
                expect(result[1].name).toBe('John Doe');
            });

            it('should handle skip and take together', async () => {
                const query = {
                    skip: 1,
                    take: 2,
                    order: { name: OrderDirectionEnum.ASC }, // Order to ensure consistent results
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Bob Johnson');
                expect(result[1].name).toBe('Jane Smith');
            });

            it('should handle pagination with relations', async () => {
                const query = {
                    skip: 1,
                    take: 2,
                    order: { name: OrderDirectionEnum.ASC },
                    relations: ['profile'],
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(2);
                expect(result[0].profile).toBeDefined();
                expect(result[1].profile).toBeDefined();
            });

            it('should return empty array when skip exceeds total count', async () => {
                const query = {
                    skip: 10,
                    take: 2,
                };

                queryBuilder = new FindQueryBuilder(userRepository, query);
                const result = await queryBuilder.getMany();

                expect(result).toHaveLength(0);
            });
        });
    });
});
