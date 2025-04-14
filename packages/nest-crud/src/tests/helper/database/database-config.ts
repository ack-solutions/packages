import { DataSource, DataSourceOptions } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { Comment } from './entities/comment-test.entity';
import { Post } from './entities/post-test.entity';
import { Profile } from './entities/profile-test.entity';
import { User } from './entities/user-test.entity';


export class TestDatabaseConfig {

    private static dataSource: DataSource;

    static getDataSourceOptions(options: Partial<DataSourceOptions> = {}): DataSourceOptions {
        return {
            type: 'sqlite',
            database: ':memory:',
            entities: [
                User,
                Post,
                Profile,
                Comment,
            ],
            synchronize: true,
            logging: ['error'], //  "query" | "schema" | "error" | "warn" | "info" | "log" | "migration"
            extra: {
                json: true,
            },
            ...options,
        } as SqliteConnectionOptions;
    }

    static async createDataSource(options: Partial<DataSourceOptions> = {}): Promise<DataSource> {
        const dataSource = new DataSource(this.getDataSourceOptions(options));
        await dataSource.initialize();
        this.dataSource = dataSource;
        return dataSource;
    }

    static async seedDatabase(testData: any[] = defaultTestData) {
        if (!this.dataSource) {
            throw new Error('DataSource not initialized. Call createDataSource first.');
        }

        const userRepository = this.dataSource.getRepository(User);
        return userRepository.save(testData);
    }

    static async cleanDatabase() {
        if (!this.dataSource) {
            throw new Error('DataSource not initialized');
        }
        await this.dataSource.synchronize(true);
    }

    static async closeDatabase() {
        if (this.dataSource) {
            await this.dataSource.destroy();
        }
    }

}

export const defaultTestData: any[] = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        profile: {
            age: 25,
            verified: true,
            bio: 'Software Engineer',
        },
        posts: [
            {
                title: 'First Post',
                content: 'Content 1',
                status: 'published',
                likes: 10,
                tags: ['tech', 'news'],
            },
            {
                title: 'Second Post',
                content: 'Content 2',
                status: 'draft',
                likes: 5,
                tags: ['personal'],
            },
        ],
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'inactive',
        profile: {
            age: 30,
            verified: false,
            bio: 'Software Engineer',
        },
        posts: [
            {
                title: 'Hello World',
                content: 'Content 3',
                status: 'published',
                likes: 20,
                tags: ['tech'],
            },
        ],
    },
];
