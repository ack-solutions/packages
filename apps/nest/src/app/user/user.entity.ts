import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '@ackplus/nest-crud';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User extends BaseEntity {

    @ApiProperty({ description: 'The first name of the user', example: 'John' })
    @Column()
    firstName: string;

    @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
    @Column()
    lastName: string;

    @ApiProperty({ description: 'The email of the user', example: 'john.doe@example.com' })
    @Column({ unique: true })
    email: string;

    @ApiProperty({ description: 'The password of the user', example: 'password' })
    @Column()
    password: string;


}
