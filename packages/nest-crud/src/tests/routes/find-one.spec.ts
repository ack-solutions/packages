import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { createCrudController } from '../../lib/controller/crud.controller';
import { BaseService } from '../../lib/service/base-service';
import { TestDatabaseConfig } from '../helper/database/database-config';
import { User } from '../helper/database/entities/user-test.entity';
import { TestGuard } from '../helper/guard';
import { TestInterceptor } from '../helper/interceptor';


describe('CrudController FindOne (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let testUser: User;

    beforeAll(async () => {
        dataSource = await TestDatabaseConfig.createDataSource();
    });

    beforeEach(async () => {
        // Clean and seed database
        await TestDatabaseConfig.cleanDatabase();
        const users = await TestDatabaseConfig.seedDatabase();
        testUser = users[0];

        const UserCrudController = createCrudController({
            name: 'users',
            path: 'users',
            entity: User,
            routes: {
                findOne: {
                    enabled: true,
                    guards: [new TestGuard()],
                    interceptors: [new TestInterceptor()],
                },
            },
        });

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserCrudController],
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

    describe('GET /users/:id', () => {
        it('should return single user with guard and interceptor', () => {
            return request(app.getHttpServer())
                .get(`/users/${testUser.id}?allow=true`)
                .expect(200)
                .expect(res => {
                    expect(res.body.name).toBe('John Doe');
                    expect(res.body.intercepted).toBe(true);
                });
        });

        it('should return user with relations when requested', () => {
            return request(app.getHttpServer())
                .get(`/users/${testUser.id}?allow=true`)
                .query({
                    relations: ['profile', 'posts'],
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.profile).toBeDefined();
                    expect(res.body.posts).toBeDefined();
                    expect(res.body.intercepted).toBe(true);
                });
        });

        it('should be blocked by guard when not allowed', () => {
            return request(app.getHttpServer())
                .get(`/users/${testUser.id}?allow=false`)
                .expect(403);
        });

        it('should return 404 for non-existent user', () => {
            return request(app.getHttpServer())
                .get('/users/999999?allow=true')
                .expect(404);
        });

        it('should handle complex query parameters', () => {
            return request(app.getHttpServer())
                .get(`/users/${testUser.id}?allow=true`)
                .query({
                    select: [
                        'id',
                        'name',
                        'email',
                    ],
                    relations: ['profile', 'posts'],
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.name).toBeDefined();
                    expect(res.body.email).toBeDefined();
                    expect(res.body.profile).toBeDefined();
                    expect(res.body.posts).toBeDefined();
                    expect(res.body.intercepted).toBe(true);
                });
        });
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    afterAll(async () => {
        await TestDatabaseConfig.closeDatabase();
    });
});
