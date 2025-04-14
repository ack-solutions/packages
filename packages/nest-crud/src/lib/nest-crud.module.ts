import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports: [TypeOrmModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class NestCrudModule { }
