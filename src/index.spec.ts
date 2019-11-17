import {Entity, createConnection, PrimaryGeneratedColumn, getConnection, ManyToMany, JoinTable} from "typeorm"
import {Subscriber, EncryptedColumn} from './index'
import 'reflect-metadata'

@Entity()
class Test{
  @PrimaryGeneratedColumn()
  id: number

  @EncryptedColumn({
    type: "varchar",
    nullable: false,
    encrypt: {
      key: "d85117047fd06d3afa79b6e44ee3a52eb426fc24c3a2e3667732e8da0342b4da",
      algorithm: "aes-256-cbc",
      ivLength: 16
    }
  })
  secret: string

  @ManyToMany(type => Second, entity => entity.parents, { cascade: true })
  @JoinTable()
  children: Second[]
}

@Entity()
class Second{
  @PrimaryGeneratedColumn()
  id: number

  @ManyToMany(type => Test, test => test.children)
  parents: Test[]
}

beforeAll(async () => {
  await createConnection({
    type: 'sqljs',
    entities: [Test, Second],
    subscribers: [Subscriber],
    synchronize: true
  })
})

test('It should encrypt data', async () => {
  let entity = new Test
  entity.secret = 'testing'

  let connection = getConnection()
  let repository = connection.getRepository(Test)

  const result = await repository.save(entity)

  expect(result.secret).toBe('testing') // decrypted after insert

  const raw = await repository
    .createQueryBuilder('test')
    .getRawOne()

  expect(raw.test_secret).not.toBe('testing') // properly encrypted in db
})

test('It should fetch encrypted data', async () => {
  let connection = getConnection()
  let repository = connection.getRepository(Test)

  let t = await repository.findOneOrFail()

  expect(t.secret).toBe('testing')
})

test('it should update data', async () => {
  let connection = getConnection()
  let repository = connection.getRepository(Test)

  let t = await repository.findOneOrFail()

  expect(t.secret).toBe('testing')

  t.secret = 'tested'

  const result = await repository.save(t)

  expect(result.secret).toBe('tested')

  let u = await repository.findOneOrFail()

  expect(u.secret).toBe('tested')

  const raw = await repository
    .createQueryBuilder('test')
    .getRawOne()

  expect(raw.test_secret).not.toBe('tested') // properly encrypted in db
})

test('N:N relation should be saved', async () => {
  let connection = getConnection()
  let repository = connection.getRepository(Test)

  let t = await repository.findOneOrFail()

  t.children = [new Second, new Second]

  await repository.save(t)
})

test('N:N relation should be joined', async () => {
  let connection = getConnection()
  let repository = connection.getRepository(Test)

  let t = await repository.findOneOrFail({ relations: ['children'] })

  expect(t.children.length).toBe(2)
})
