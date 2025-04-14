import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { Comment } from './comment-test.entity';
import { User } from './user-test.entity';
import { BaseEntity } from '../../../../lib/base-entity';


@Entity('posts')
export class Post extends BaseEntity {

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column()
    status: string;

    @Column('int')
    likes: number;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @ManyToOne(() => User, user => user.posts)
    user: User;

    @OneToMany(() => Comment, comment => comment.post, {
        cascade: true,
    })
    comments: Comment[];

}
