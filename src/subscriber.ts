import {EntitySubscriberInterface, EventSubscriber, InsertEvent, ObjectLiteral, UpdateEvent} from 'typeorm'

import {decrypt, encrypt} from './events'

@EventSubscriber()
export class Subscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<ObjectLiteral>) {
    encrypt(event.entity)
  }

  afterInsert(event: InsertEvent<ObjectLiteral>): Promise<any> | void {
    decrypt(event.entity)
  }

  beforeUpdate(event: UpdateEvent<ObjectLiteral>) {
    const updatedColumns = event.updatedColumns.map(({propertyName}) => propertyName)
    encrypt(event.entity, updatedColumns)
  }

  afterUpdate(event: UpdateEvent<ObjectLiteral>) {
    const updatedColumns = event.updatedColumns.map(({propertyName}) => propertyName)
    decrypt(event.entity, updatedColumns)
  }

  afterLoad(entity: ObjectLiteral) {
    decrypt(entity)
  }
}
