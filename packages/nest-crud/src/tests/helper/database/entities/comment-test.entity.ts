import { Entity, Column, ManyToOne } from 'typeorm';

import { Post } from './post-test.entity';
import { User } from './user-test.entity';
import { BaseEntity } from '../../../../lib/base-entity';


@Entity('comments')
export class Comment extends BaseEntity {

    @Column('text')
    content: string;

    @Column('int')
    rating: number;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @ManyToOne(() => User)
    author: User;

}
