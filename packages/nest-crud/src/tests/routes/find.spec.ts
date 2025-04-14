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


describe('CrudController Find Route (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await TestDatabaseConfig.createDataSource();
    });

    beforeEach(async () => {
        await TestDatabaseConfig.cleanDatabase();
        await TestDatabaseConfig.seedDatabase();

        const UserCrudController = createCrudController({
            name: 'users',
            path: 'users',
            entity: User,
            routes: {
                find: {
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

    describe('Basic Find Operations', () => {
        it('should return all users with guard and interceptor', () => {
            return request(app.getHttpServer())
                .get('/users?allow=true')
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(2); // Default test data has 2 users
                    expect(res.body.intercepted).toBe(true);
                });
        });

        it('should be blocked by guard when not allowed', () => {
            return request(app.getHttpServer())
                .get('/users?allow=false')
                .expect(403);
        });
    });

    describe('Query Parameters', () => {
        it('should handle where conditions', () => {
            return request(app.getHttpServer())
                .get('/users?allow=true')
                .query({
                    where: {
                        status: 'active',
                    },
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(1);
                    expect(res.body.data[0].status).toBe('active');
                });
        });

        it('should handle relations', () => {
            return request(app.getHttpServer())
                .get('/users?allow=true')
                .query({
                    relations: ['profile', 'posts'],
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data[0].profile).toBeDefined();
                    expect(res.body.data[0].posts).toBeDefined();
                });
        });

        it('should handle pagination', () => {
            return request(app.getHttpServer())
                .get('/users?allow=true')
                .query({
                    skip: 0,
                    take: 1,
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(1);
                    expect(res.body.total).toBe(2);
                });
        });

        it('should handle complex where conditions', () => {
            return request(app.getHttpServer())
                .get('/users?allow=true')
                .query({
                    where: {
                        $and: [{ status: 'active' }, { 'profile.verified': true }],
                    },
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toHaveLength(1);
                });
        });
    });
});

describe('CrudController with Class Level Guards and Interceptors', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = await TestDatabaseConfig.createDataSource();
    });

    beforeEach(async () => {
        await TestDatabaseConfig.cleanDatabase();
        await TestDatabaseConfig.seedDatabase();

        const UserCrudController = createCrudController({
            name: 'users',
            path: 'users',
            entity: User,
            guards: [new TestGuard()],
            interceptors: [new TestInterceptor()],
            routes: {
                find: {
                    enabled: true,
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

    it('should apply class level guards and interceptors', () => {
        return request(app.getHttpServer())
            .get('/users?allow=true')
            .expect(200)
            .expect(res => {
                expect(res.body.data).toHaveLength(2);
                expect(res.body.intercepted).toBe(true);
            });
    });

    it('should block access with class level guard', () => {
        return request(app.getHttpServer())
            .get('/users?allow=false')
            .expect(403);
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
