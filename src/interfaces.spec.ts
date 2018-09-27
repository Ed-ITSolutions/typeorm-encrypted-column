import {Entity} from 'typeorm'
import {EncryptedColumn} from './interfaces'

test('It should throw an error when creating an invalid key', () => {
  expect(() => {
    @Entity()
    class TestCase{
      @EncryptedColumn({
        encrypt: {
          key: 'foo',
          algorithm: 'aes-256-cbc',
          ivLength: 16
        }
      })
      test: string
    }

    let tc = new TestCase
    tc.test = 'foo'
  }).toThrow('Invalid Key')
})

test('It should throw an error when creating an invalid key', () => {
  expect(() => {
    @Entity()
    class TestCase{
      @EncryptedColumn({
        encrypt: {
          key: 'foo',
          algorithm: 'aes-256-bc',
          ivLength: 16
        }
      })
      test: string
    }

    let tc = new TestCase
    tc.test = 'foo'
  }).toThrow('Invalid Algorithm')
})