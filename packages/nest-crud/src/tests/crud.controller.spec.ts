import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createCrudController } from '../lib/controller/crud.controller';
import { BaseService } from '../lib/service/base-service';
import { CrudOptions } from '../lib/types/crud';
import { TestDatabaseConfig } from './helper/database/database-config';
import { User } from './helper/database/entities/user-test.entity';


describe('Crud Controller Routes', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let testUser: User;

    beforeAll(async () => {
        // Initialize database using common config
        dataSource = await TestDatabaseConfig.createDataSource();
    });

    beforeEach(async () => {
        // Clean and seed database
        await TestDatabaseConfig.cleanDatabase();
        const users = await TestDatabaseConfig.seedDatabase();
        testUser = users[0];

        // Setup NestJS module
        const crudOptions: CrudOptions = {
            name: 'users',
            path: 'users',
            entity: User,
            routes: {
                find: true,
                findOne: true,
                create: true,
                createMany: true,
                update: true,
                updateMany: true,
                delete: true,
                deleteMany: true,
                deleteFromTrash: true,
                restore: true,
                reorder: false,
            },
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [createCrudController(crudOptions)],
            providers: [
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
                {
                    provide: BaseService,
                    useFactory: () => new BaseService<User>(dataSource.getRepository(User)),
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('GET /users', () => {
        it('should return users list', () => {
            return request(app.getHttpServer())
                .get('/users')
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(2); // Using default test data
                    expect(res.body.data[0].name).toBe('John Doe');
                });
        });

        it('should return filtered users', () => {
            return request(app.getHttpServer())
                .get('/users')
                .query({
                    where: {
                        status: 'active',
                        'profile.verified': true,
                    },
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(1);
                    expect(res.body.data[0].name).toBe('John Doe');
                });
        });

        it('should return users with relations', () => {
            return request(app.getHttpServer())
                .get('/users')
                .query({
                    relations: ['profile', 'posts'],
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data[0].profile).toBeDefined();
                    expect(res.body.data[0].posts).toHaveLength(2); // John has 2 posts in default data
                });
        });
    });

    describe('GET /users/:id', () => {
        it('should return single user', () => {
            return request(app.getHttpServer())
                .get(`/users/${testUser.id}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.name).toBe('John Doe');
                });
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .get('/users/999999')
                .expect(404);
        });
    });

    describe('POST /users', () => {
        it('should create new user', () => {
            return request(app.getHttpServer())
                .post('/users')
                .send({
                    name: 'New User',
                    email: 'new@example.com',
                    status: 'active',
                    profile: {
                        age: 35,
                        verified: true,
                    },
                })
                .expect(201)
                .expect(res => {
                    expect(res.body.name).toBe('New User');
                    expect(res.body.id).toBeDefined();
                });
        });
    });

    describe('POST /users/many', () => {
        it('should create multiple users', () => {
            return request(app.getHttpServer())
                .post('/users/many')
                .send({
                    creates: [
                        {
                            name: 'Bulk User 1',
                            email: 'bulk1@example.com',
                            status: 'active',
                        },
                        {
                            name: 'Bulk User 2',
                            email: 'bulk2@example.com',
                            status: 'inactive',
                        },
                    ],
                })
                .expect(201)
                .expect(res => {
                    expect(res.body).toHaveLength(2);
                });
        });
    });

    describe('PUT /users/:id', () => {
        it('should update user', () => {
            return request(app.getHttpServer())
                .put(`/users/${testUser.id}`)
                .send({
                    name: 'Updated Name',
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.name).toBe('Updated Name');
                });
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete user', () => {
            return request(app.getHttpServer())
                .delete(`/users/${testUser.id}`)
                .expect(200);
        });

        it('should verify deletion', async () => {
            await request(app.getHttpServer())
                .delete(`/users/${testUser.id}`)
                .expect(200);

            return request(app.getHttpServer())
                .get(`/users/${testUser.id}`)
                .expect(404);
        });
    });

    describe('Complex Operations', () => {
        it('should handle nested relations in query', () => {
            return request(app.getHttpServer())
                .get('/users')
                .query({
                    where: {
                        $and: [
                            { status: 'active' },
                            { 'posts.status': 'published' },
                            { 'profile.verified': { $isTrue: true } },
                        ],
                    },
                    relations: ['posts', 'profile'],
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(1);
                    expect(res.body.data[0].posts).toBeDefined();
                    expect(res.body.data[0].profile).toBeDefined();
                });
        });
    });

    afterEach(async () => {
        await app.close();
    });

    afterAll(async () => {
        await TestDatabaseConfig.closeDatabase();
    });
});
