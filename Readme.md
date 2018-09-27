# Typeorm Encrypted Column

Typeorm Encrypted Column is a replacement for [typeorm-encrypted](https://github.com/generalpiston/typeorm-encrypted).

## Differences

Typeorm Encrypted Column works slightly differently.

Typeorm Encrypted COlumn uses a decorator instead of retyping the options object passed to column. Using this decorator it validates the key and algorithm provided throwing an error if its not. This moves config errors to startup not the first time its used.

## Usage

```ts
import {Entity, PrimaryGeneratedColumn, Column, createConnection} from 'typeorm'
import {Subscriber as EncryptedColumnSubscriber, EncryptedColumn} from 'typeorm-encrypted-column'

@Entity()
class ProtectedData{
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @EncryptedColumn({
    encrypt: {
      key: 'd85117047fd06d3afa79b6e44ee3a52eb426fc24c3a2e3667732e8da0342b4da',
      algorithm: 'aes-256-cbc',
      ivLength: 16
    }
  })
}

let connection = createConnection({
  ...
  entities: [ProtectedData],
  subscribers: [EncryptedColumnSubscriber]
})
```

## Contributing

Pull requests and issues are welcome on this repository.

To build locally pull a copy of the repository and run npm install to get the dependecies.

Testing is done with `npm test` which will test the code.

