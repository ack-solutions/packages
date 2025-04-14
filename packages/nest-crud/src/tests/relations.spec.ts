import { OrderDirectionEnum } from '@ackplus/nest-crud-request';
import { Repository } from 'typeorm';

import { FindQueryBuilder } from '../lib/service/find-query-builder';
import { TestDatabaseConfig } from './helper/database/database-config';
import { User } from './helper/database/entities/user-test.entity';


describe('FindQueryBuilder - Relations Tests', () => {
    let userRepository: Repository<User>;
    let queryBuilder: FindQueryBuilder<User>;

    beforeAll(async () => {
        const dataSource = await TestDatabaseConfig.createDataSource();
        userRepository = dataSource.getRepository(User);
    });

    beforeEach(async () => {
        await TestDatabaseConfig.cleanDatabase();
        // Seed test data with nested relations
        await TestDatabaseConfig.seedDatabase([
            {
                name: 'John Doe',
                email: 'john@example.com',
                status: 'active',
                profile: {
                    age: 30,
                    bio: 'Senior Developer',
                    preferences: {
                        theme: 'dark',
                        notifications: true,
                    },
                },
                posts: [
                    {
                        title: 'Post 1',
                        content: 'Content 1',
                        likes: 100,
                        comments: [
                            {
                                text: 'Great post!',
                                author: 'User1',
                            },
                            {
                                text: 'Nice work!',
                                author: 'User2',
                            },
                        ],
                    },
                    {
                        title: 'Post 2',
                        content: 'Content 2',
                        likes: 50,
                        comments: [
                            {
                                text: 'Interesting',
                                author: 'User3',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                status: 'active',
                profile: {
                    age: 25,
                    bio: 'Junior Developer',
                    preferences: {
                        theme: 'light',
                        notifications: false,
                    },
                },
                posts: [
                    {
                        title: 'Post 3',
                        content: 'Content 3',
                        likes: 75,
                        comments: [],
                    },
                ],
            },
        ]);
    });

    describe('Basic Relations', () => {
        it('should load single relation as string', async () => {
            const query = {
                relations: 'profile',
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile).toBeDefined();
            expect(result[0].profile.age).toBeDefined();
            expect(result[0].posts).toBeUndefined();
        });

        it('should load multiple relations as array', async () => {
            const query = {
                relations: ['profile', 'posts'],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile).toBeDefined();
            expect(result[0].posts).toBeDefined();
            expect(Array.isArray(result[0].posts)).toBeTruthy();
        });

        it('should load relations as object with boolean values', async () => {
            const query = {
                relations: {
                    profile: true,
                    posts: false,
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile).toBeDefined();
            expect(result[0].posts).toBeUndefined();
        });
    });

    describe('Nested Relations', () => {
        it('should load nested relations using dot notation', async () => {
            const query = {
                relations: ['profile.bio', 'posts.comments'],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile.bio).toBeDefined();
            expect(result[0].posts[0].comments).toBeDefined();
        });

        it('should load deeply nested relations', async () => {
            const query = {
                relations: ['profile.bio', 'posts.comments.author'],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile.bio).toBeDefined();
            expect(result[0].posts[0].comments[0].author).toBeDefined();
        });

        it('should handle mixed relation formats', async () => {
            const query = {
                relations: {
                    profile: true,
                    'posts.comments': true,
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile).toBeDefined();
            expect(result[0].posts[0].comments).toBeDefined();
            expect(result[0].profile.bio).toBeUndefined();
        });
    });

    describe('Relations with Conditions', () => {
        it('should combine relations with where conditions', async () => {
            const query = {
                relations: ['profile', 'posts'],
                where: {
                    'profile.age': { $gt: 25 },
                    'posts.likes': { $gt: 50 },
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
            expect(result[0].profile).toBeDefined();
            expect(result[0].posts).toBeDefined();
        });

        it('should handle relations with ordering', async () => {
            const query = {
                relations: ['posts'],
                order: {
                    'posts.likes': OrderDirectionEnum.DESC,
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].posts[0].likes).toBeGreaterThan(result[0].posts[1].likes);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty relations', async () => {
            const query = {
                relations: [],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].profile).toBeUndefined();
            expect(result[0].posts).toBeUndefined();
        });

        it('should handle invalid relations gracefully', async () => {
            const query = {
                relations: ['nonexistentRelation'],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            await expect(queryBuilder.getMany()).rejects.toThrow();
        });

        it('should handle circular relations', async () => {
            const query = {
                relations: ['posts.user.posts'],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].posts[0].user).toBeDefined();
            expect(result[0].posts[0].user.posts).toBeDefined();
        });
    });

    describe('Performance', () => {
        it('should generate efficient SQL with proper joins', async () => {
            const query = {
                relations: ['profile', 'posts.comments'],
                where: {
                    'profile.age': { $gt: 25 },
                    'posts.likes': { $gt: 50 },
                },
                order: {
                    'posts.likes': OrderDirectionEnum.DESC,
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const sql = queryBuilder.getQueryBuilder().getSql();

            // Verify SQL structure
            expect(sql).toContain('LEFT JOIN "profile"');
            expect(sql).toContain('LEFT JOIN "posts"');
            expect(sql).toContain('LEFT JOIN "comments"');
            expect(sql.match(/LEFT JOIN/g)?.length).toBe(3); // Should have exactly 3 joins
        });
    });

    afterAll(async () => {
        await TestDatabaseConfig.closeDatabase();
    });
});

describe('FindQueryBuilder - Advanced Relations Tests', () => {
    let userRepository: Repository<User>;
    let queryBuilder: FindQueryBuilder<User>;

    beforeAll(async () => {
        const dataSource = await TestDatabaseConfig.createDataSource();
        userRepository = dataSource.getRepository(User);
    });

    beforeEach(async () => {
        await TestDatabaseConfig.cleanDatabase();
        await TestDatabaseConfig.seedDatabase([
            {
                name: 'John Doe',
                email: 'john@example.com',
                status: 'active',
                profile: {
                    age: 30,
                    bio: 'Senior Developer',
                    verified: true,
                    settings: {
                        theme: 'dark',
                        notifications: true,
                        language: 'en',
                    },
                },
                posts: [
                    {
                        title: 'TypeScript Tips',
                        content: 'Content 1',
                        status: 'published',
                        likes: 100,
                        tags: ['typescript', 'programming'],
                        comments: [
                            {
                                content: 'Great post!',
                                rating: 5,
                                author: { name: 'Jane Smith' },
                            },
                        ],
                    },
                ],
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                status: 'active',
                profile: {
                    age: 25,
                    bio: 'Frontend Developer',
                    verified: true,
                    settings: {
                        theme: 'light',
                        notifications: false,
                        language: 'fr',
                    },
                },
                posts: [
                    {
                        title: 'React Hooks',
                        content: 'Content 2',
                        status: 'draft',
                        likes: 50,
                        tags: ['react', 'javascript'],
                        comments: [],
                    },
                ],
            },
        ]);
    });

    describe('Relations with Select', () => {
        it('should select specific fields from multiple relations using dot notation', async () => {
            const query = {
                relations: [
                    'profile.age',
                    'profile.settings.theme',
                    'posts.title',
                    'posts.likes',
                ],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0]).toEqual(
                expect.objectContaining({
                    profile: expect.objectContaining({
                        age: 30,
                        settings: expect.objectContaining({
                            theme: 'dark',
                        }),
                    }),
                    posts: expect.arrayContaining([
                        expect.objectContaining({
                            title: 'TypeScript Tips',
                            likes: 100,
                        }),
                    ]),
                }),
            );

            // Verify excluded fields
            expect(result[0].profile.bio).toBeUndefined();
            expect(result[0].posts[0].content).toBeUndefined();
        });

        it('should handle deeply nested relation selections', async () => {
            const query = {
                relations: [
                    'posts.comments.author.name',
                    'posts.comments.rating',
                    'profile.settings.language',
                ],
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result[0].posts[0].comments[0]).toEqual(
                expect.objectContaining({
                    rating: 5,
                    author: expect.objectContaining({
                        name: 'Jane Smith',
                    }),
                }),
            );
        });
    });

    describe('Relations with Where Conditions', () => {
        it('should filter by nested relation fields', async () => {
            const query = {
                relations: ['profile', 'posts'],
                where: {
                    'profile.settings.theme': 'dark',
                    'posts.likes': { $gt: 75 },
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
        });

        it('should combine multiple relation conditions with AND/OR', async () => {
            const query = {
                relations: [
                    'profile',
                    'posts',
                    'posts.comments',
                ],
                where: {
                    $or: [
                        {
                            'profile.age': { $lt: 26 },
                            'posts.status': 'draft',
                        },
                        {
                            'posts.comments.rating': { $gt: 4 },
                            'profile.verified': true,
                        },
                    ],
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(2);
        });
    });

    describe('Relations with Select and Where', () => {
        it('should combine field selection with filtering', async () => {
            const query = {
                relations: [
                    {
                        relation: 'profile',
                        select: ['age'],
                    },
                    {
                        relation: 'posts',
                        select: ['title', 'likes'],
                    },
                ],
                where: {
                    'profile.age': { $gt: 25 },
                    'posts.likes': { $gt: 50 },
                },
            };

            queryBuilder = new FindQueryBuilder(userRepository, query as any);
            const result = await queryBuilder.getMany();

            expect(result).toHaveLength(1);
            expect(result[0].profile.age).toBe(30);
            expect(result[0].profile.bio).toBeUndefined();
            expect(result[0].posts[0].likes).toBe(100);
        });
    });

    afterAll(async () => {
        await TestDatabaseConfig.closeDatabase();
    });
});
