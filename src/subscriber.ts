import {EventSubscriber, EntitySubscriberInterface, InsertEvent, ObjectLiteral, UpdateEvent} from 'typeorm'

import {encrypt, decrypt} from './events'

@EventSubscriber()
export class Subscriber implements EntitySubscriberInterface{
  beforeInsert(event: InsertEvent<ObjectLiteral>){
    encrypt(event.entity)
  }

  beforeUpdate(event: UpdateEvent<ObjectLiteral>){
    encrypt(event.entity)
  }

  afterLoad(entity: ObjectLiteral){
    decrypt(entity)
  }
}