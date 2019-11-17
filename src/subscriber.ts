import {EventSubscriber, EntitySubscriberInterface, InsertEvent, ObjectLiteral, UpdateEvent} from 'typeorm'

import {encrypt, decrypt} from './events'

@EventSubscriber()
export class Subscriber implements EntitySubscriberInterface{
  beforeInsert(event: InsertEvent<ObjectLiteral>){
    encrypt(event.entity)
  }

  beforeUpdate(event: UpdateEvent<ObjectLiteral>){
    const updatedColumns = event.updatedColumns.map(({propertyName}) => propertyName)
    encrypt(event.entity, updatedColumns)
  }

  afterLoad(entity: ObjectLiteral){
    decrypt(entity)
  }
}
