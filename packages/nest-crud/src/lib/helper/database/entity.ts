import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';


export function Entity(entityClass: any) {
    // Get all property descriptors from TypeOrmBaseEntity prototype
    const typeOrmDescriptors = Object.getOwnPropertyDescriptors(TypeOrmBaseEntity.prototype);

    // Remove the constructor from the descriptors
    if (typeOrmDescriptors.constructor) {
        delete (typeOrmDescriptors as any).constructor;
    }

    // Copy each property and method to the entityClass prototype
    Object.defineProperties(entityClass.prototype, typeOrmDescriptors);

    return entityClass;
}
