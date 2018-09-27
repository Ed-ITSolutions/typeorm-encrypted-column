import {Entity, createConnection, PrimaryGeneratedColumn} from "typeorm"
import {Subscriber, EncryptedColumn} from './index'
import {encrypt, decrypt} from './events'
import 'reflect-metadata'

@Entity()
class Test{
  @PrimaryGeneratedColumn()
  id: number

  @EncryptedColumn({
    encrypt: {
      key: "d85117047fd06d3afa79b6e44ee3a52eb426fc24c3a2e3667732e8da0342b4da",
      algorithm: "aes-256-cbc",
      ivLength: 16
    }
  })
  secret: string
}

beforeAll(async () => {
  await createConnection({
    type: 'sqljs',
    entities: [Test],
    subscribers: [Subscriber]
  })
})

test('encrypt should encrypt an entity', () => {
  let entity = new Test()
  entity.secret = 'test'

  let newEntity = encrypt(entity)

  expect(newEntity.secret).not.toBe('test')
})

test('decrypt should decrypt an entity', () => {
  let entity = new Test()
  entity.secret = 'test'

  let newEntity = encrypt(entity)

  expect(newEntity.secret).not.toBe('test')

  let decryptedEntity = decrypt(newEntity)

  expect(decryptedEntity.secret).toBe('test')
})