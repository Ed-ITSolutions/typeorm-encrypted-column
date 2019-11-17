import {getMetadataArgsStorage, ObjectLiteral} from 'typeorm'
import {EncryptedColumnOptions, EncryptionOptions} from './interfaces'
import {createCipheriv, createDecipheriv, randomBytes} from 'crypto'

/**
 * For all columns that have encryption options run the supplied function.
 *
 * @param entity The typeorm Entity.
 * @param cb Function to run for matching columns.
 * @param includeProperties filter encrypted properties by propertyName
 */
const forMatchingColumns = (entity: ObjectLiteral, cb: (propertyName: string, options: EncryptionOptions) => void, includeProperties: string[] = []) => {
    // Iterate through all columns in Typeorm
    let validColumns = getMetadataArgsStorage().columns
      .filter(({options, mode, target, propertyName}) => {
          const {encrypt} = options as EncryptedColumnOptions

          return entity[propertyName] &&
            mode === 'regular' &&
            encrypt &&
            (encrypt.looseMatching || entity.constructor === target)
      })
      // dedup
      .filter((item, pos, self) => self.findIndex(v => v.propertyName === item.propertyName) === pos)

    // encrypt only the requested properties (property changes on update)
    if (includeProperties.length > 0) {
        validColumns = validColumns.filter(({propertyName}) => includeProperties.includes(propertyName))
    }

    validColumns
      .forEach(({propertyName, options}) => {
          const {encrypt} = options as EncryptedColumnOptions
          cb(propertyName, encrypt)
      })
}

/**
 * Checks the supplied entity for encrypted columns and encrypts any columns that need it.
 *
 * @param entity Typeorm Entity to check.
 * @param includeProperties
 */
export const encrypt = <T extends ObjectLiteral>(entity: T, includeProperties: string[] = []): T => {
    if (!entity) return entity

    forMatchingColumns(entity, (propertyName, options) => {
        // For any matching columns encrypt the property
        entity[propertyName] = encryptString(entity[propertyName], options)
    }, includeProperties)

    return entity
}

/**
 * Encrypts the supplied string with the columns options.
 *
 * @param string The string to encrypt.
 * @param options The encryption options.
 */
const encryptString = (string: string, options: EncryptionOptions) => {
    const buffer = Buffer.from(string, 'utf8')
    const iv = randomBytes(options.ivLength)
    const key = Buffer.from(options.key, 'hex')

    const cipher = createCipheriv(options.algorithm, key, iv)
    const start = cipher.update(buffer)
    const end = cipher.final()

    return Buffer.concat([iv, start, end]).toString('base64')
}

/**
 * Checks the supplied entity for columns that need decrypting and decrypts them.
 *
 * @param entity The typeorm entity to check
 * @param includeProperties
 */
export const decrypt = <T extends ObjectLiteral>(entity: T, includeProperties: string[] = []): T => {
    if (!entity) return entity

    forMatchingColumns(entity, (propertyName, options) => {
        // For any matching columns decrypt the property
        entity[propertyName] = decryptString(entity[propertyName], options)
    }, includeProperties)

    return entity
}

/**
 * Decrypts the supplied string using the column options.
 *
 * @param string The string to decrypt,
 * @param options The encryption options.
 */
const decryptString = (string: string, options: EncryptionOptions) => {
    const buffer = Buffer.from(string, 'base64')
    const iv = buffer.slice(0, options.ivLength)
    const key = Buffer.from(options.key, 'hex')

    const decipher = createDecipheriv(options.algorithm, key, iv)
    const start = decipher.update(buffer.slice(options.ivLength))
    const end = decipher.final()

    return Buffer.concat([start, end]).toString('utf8')
}
