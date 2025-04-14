import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { isNil } from 'lodash';

import { ApiProperty } from './swagger.helper';
import { CrudOptions, CrudValidationGroupsEnum } from '../interface/crud';
import { isFalse } from '../utils';


class FindManyDto {

}

class FindOneDto {

}

class DeleteManyDto {

}

class ReorderDto {

}

class BulkDto<T> {

    bulk: T[];

}

class RestoreManyDto {

}

export class Validation {

    static getValidationPipe(options: ValidationPipeOptions = {}, group?: CrudValidationGroupsEnum): ValidationPipe {
        return new ValidationPipe({
            ...options,
            groups: group ? [group] : undefined,
        });
    }

    static createFindManyDto(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */

        if (!isFalse(options.validation)) {
            class FindManyImpl {

                @ApiPropertyOptional({ description: 'Relations to include in the query' })
                @IsOptional()
                relations?: any[] | Record<string, boolean> | string;

                @ApiPropertyOptional({
                    description: 'Conditions to filter the query',
                    example: {
                        $or: [
                            {
                                firstName: { $like: '%John%' },
                                lastName: { $like: '%Doe%' },
                            },
                            {
                                lastName: { $like: '%Doe%' },
                                firstName: { $like: '%John%' },
                            },
                        ],
                        // Example without dot notation for flat properties
                        age: {
                            $gt: 18,
                            $lt: 65,
                        },
                        status: { $in: ['active', 'inactive'] },
                        joinedDate: { $between: ['2020-01-01', '2021-01-01'] },
                    },
                })
                @IsOptional()
                @IsObject()
                where?: any; // Example provided for usage

                @ApiPropertyOptional({
                    description: 'Order of the results',
                    example: {
                        // Example with dot notation for nested properties
                        'profile.age': 'ASC',
                        'profile.name': 'DESC',
                        'profile.joinedDate': 'ASC',

                        // Example without dot notation for flat properties
                        age: 'ASC',
                        name: 'DESC',
                        joinedDate: 'ASC',
                    },
                })
                @IsOptional()
                @IsObject()
                order?: {
                    [key: string]: 'ASC' | 'DESC';
                };

                @ApiPropertyOptional({ description: 'Number of records to skip' })
                @IsOptional()
                @IsNumber()
                skip?: number;

                @ApiPropertyOptional({ description: 'Number of records to take' })
                @IsOptional()
                @IsNumber()
                take?: number;


            }
            Object.defineProperty(FindManyImpl, 'name', {
                writable: false,
                value: `FindMany${options.entity.name}Dto`,
            });
            return FindManyImpl;
        }

        return FindManyDto;
    }

    static createFindOneDto(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */

        if (!isFalse(options.validation)) {
            class FindOneImpl {

                @ApiPropertyOptional({ description: 'Relations to include in the query' })
                @IsOptional()
                relations?: any[] | Record<string, boolean> | string;

            }
            Object.defineProperty(FindOneImpl, 'name', {
                writable: false,
                value: `FindOne${options.entity.name}Dto`,
            });
            return FindOneImpl;
        }

        return FindOneDto;
    }

    /* istanbul ignore else */
    static createBulkDto<T = any>(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */
        if (!isFalse(options.validation)) {
            const hasDto = !isNil(options.dto?.create);
            const groups = !hasDto ? [CrudValidationGroupsEnum.CREATE] : undefined;
            const always = hasDto ? true : undefined;
            const Model = hasDto ? options.dto?.create : options.entity.type;


            class BulkDtoImpl {

                @ApiProperty({
                    type: Model,
                    isArray: true,
                })
                @IsArray({
                    groups,
                    always,
                })
                @ArrayNotEmpty({
                    groups,
                    always,
                })
                @ValidateNested({
                    each: true,
                    groups,
                    always,
                })
                @Type(() => Model)
                bulk: T[];

            }

            Object.defineProperty(BulkDtoImpl, 'name', {
                writable: false,
                value: `CreateMany${options.entity.name}Dto`,
            });

            return BulkDtoImpl;
        }
        return BulkDto;
    }


    static updateBulkDto<T = any>(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */
        if (!isFalse(options.validation)) {
            const hasDto = !isNil(options.dto?.update);
            const groups = !hasDto ? [CrudValidationGroupsEnum.UPDATE] : undefined;
            const always = hasDto ? true : undefined;
            const Model = hasDto ? options.dto?.update : options.entity.type;

            class BulkDtoImpl {

                @ApiProperty({
                    type: Model,
                    isArray: true,
                })
                @IsArray({
                    groups,
                    always,
                })
                @ArrayNotEmpty({
                    groups,
                    always,
                })
                @ValidateNested({
                    each: true,
                    groups,
                    always,
                })
                @Type(() => Model)
                bulk: T[];

            }

            Object.defineProperty(BulkDtoImpl, 'name', {
                writable: false,
                value: `UpdateMany${options.entity.name}Dto`,
            });

            return BulkDtoImpl;
        }
        return BulkDto;
    }


    static createDeleteManyDto(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */
        if (!isFalse(options.validation)) {
            class DeleteManyImpl {

                @ApiPropertyOptional({
                    format: 'uuid',
                    isArray: true,
                })
                @IsOptional()
                @IsArray()
                ids?: string[];

                @ApiPropertyOptional({
                    type: String,
                })
                @IsOptional()
                @IsObject()
                where?: any;

            }
            Object.defineProperty(DeleteManyImpl, 'name', {
                writable: false,
                value: `DeleteMany${options.entity.name}Dto`,
            });
            return DeleteManyImpl;
        }
        return DeleteManyDto;
    }

    static createTrashDeleteManyDto(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */
        if (!isFalse(options.validation)) {
            return this.createDeleteManyDto(options);
        }
        return DeleteManyDto;
    }


    static createReorderDto(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */
        if (!isFalse(options.validation)) {
            class ReorderImpl {

                @ApiProperty({
                    type: String,
                    isArray: true,
                })
                @IsArray()
                @IsString({ each: true })
                ids: string[];

            }
            Object.defineProperty(ReorderImpl, 'name', {
                writable: false,
                value: `Reorder${options.entity.name}Dto`,
            });
            return ReorderImpl;
        }
        return ReorderDto;
    }

    static createRestoreManyDto(options: Partial<CrudOptions>): any {
        /* istanbul ignore else */
        if (!isFalse(options.validation)) {
            class RestoreManyImpl {

                @ApiProperty({
                    type: String,
                    isArray: true,
                })
                @IsArray()
                @IsString({ each: true })
                ids: string[];

            }
            Object.defineProperty(RestoreManyImpl, 'name', {
                writable: false,
                value: `RestoreMany${options.entity.name}Dto`,
            });
            return RestoreManyImpl;
        }
        return RestoreManyDto;
    }

}
