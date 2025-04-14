import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { Entity } from './entity';


export class TypeOrmFindQueryBuilder<Entity extends ObjectLiteral> {

    entity: EntityTarget<Entity>;
    repository: Repository<Entity>;

    constructor(entity: EntityTarget<Entity>) {
        this.repository = Entity(entity).getRepository();
    }

    find() {
        this.repository.find();
    }


}
