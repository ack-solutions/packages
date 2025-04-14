import { ApiProperty } from '@nestjs/swagger';
import { DeleteDateColumn, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


export class BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ description: 'The unique identifier of the entity' })
    id: string;

    @ApiProperty({
        description: 'The date and time the entity was created',
        readOnly: true,
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'The date and time the entity was last updated',
        readOnly: true,
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    @ApiProperty({
        description: 'The date and time the entity was deleted',
        readOnly: true,
    })
    deletedAt: Date;

}

// export class BaseEntityWithTrash extends BaseEntity {

//     @DeleteDateColumn()
//     @ApiProperty({
//         description: 'The date and time the entity was deleted',
//         readOnly: true,
//     })
//     deletedAt: Date;

// }

export class BaseEntityWithOrder extends BaseEntity {

    @Column({ default: 0 })
    order: number;

}
