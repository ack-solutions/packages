/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsArray } from 'class-validator';

import { ApiProperty } from './swagger.helper';


export class SerializeHelper {

    static createSuccessResponseDto(resourceName: string): any {
        class SuccessResponseDto {

            @ApiProperty({ type: 'string' })
            message: string;

        }

        Object.defineProperty(SuccessResponseDto, 'name', {
            writable: false,
            value: `Success${resourceName}ResponseDto`,
        });

        return SuccessResponseDto;
    }

    static createFindManyResponseDto(dto: any, resourceName: string): any {
        class FindManyResponseDto {

            @ApiProperty({
                type: dto,
                isArray: true,
            })
            @Type(() => dto)
            items: any[];

            @ApiProperty({ type: 'number' })
            total: number;

        }

        Object.defineProperty(FindManyResponseDto, 'name', {
            writable: false,
            value: `FindMany${resourceName}ResponseDto`,
        });

        return FindManyResponseDto;
    }

    static createFindOneResponseDto(resourceName: string): any {
        class FindOneResponseDto { }

        Object.defineProperty(FindOneResponseDto, 'name', {
            writable: false,
            value: `FindOne${resourceName}ResponseDto`,
        });

        return FindOneResponseDto;
    }

    static createCreateManyResponseDto(dto: any, resourceName: string): any {
        class CreateManyResponseDto {

            @IsArray()
            @ValidateNested({ each: true })
            @Type(() => dto)
            items: any[];

        }

        Object.defineProperty(CreateManyResponseDto, 'name', {
            writable: false,
            value: `CreateMany${resourceName}ResponseDto`,
        });

        return CreateManyResponseDto;
    }

    static createUpdateManyResponseDto(dto: any, resourceName: string): any {
        class UpdateManyResponseDto {

            @IsArray()
            @ValidateNested({ each: true })
            @Type(() => dto)
            items: any[];

        }

        Object.defineProperty(UpdateManyResponseDto, 'name', {
            writable: false,
            value: `UpdateMany${resourceName}ResponseDto`,
        });

        return UpdateManyResponseDto;
    }

}
