import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';

import { User } from './user-test.entity';
import { BaseEntity } from '../../../../lib/base-entity';


// Define test entities

@Entity('profiles')
export class Profile extends BaseEntity {

    @Column()
    age: number;

    @Column({ nullable: true })
    bio: string;

    @Column({ default: false })
    verified: boolean;

    @OneToOne(() => User, user => user.profile)
    @JoinColumn()
    user: User;

}
