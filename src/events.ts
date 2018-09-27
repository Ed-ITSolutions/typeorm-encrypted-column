import {ObjectLiteral, getMetadataArgsStorage} from "typeorm"
import {EncryptedColumnOptions, EncryptionOptions} from './interfaces'
import {randomBytes, createCipheriv, createDecipheriv} from 'crypto'

/**
 * For all columns that have encryption options run the supplied function.
 * 
 * @param entity The typeorm Entity.
 * @param cb Function to run for matching columns.
 */
const forMatchingColumns = (entity: ObjectLiteral, cb: (propertyName: string, options: EncryptionOptions) => void) => {
  // Iterate through all columns in Typeorm
  getMetadataArgsStorage().columns.forEach((column) => {
    // If this column is from the current entity
    if(entity.constructor === column.target){
      let {options, propertyName} = column
      let columnOptions = options as EncryptedColumnOptions

      if(
        columnOptions.encrypt // Does this column have encryption options
        &&
        column.mode === 'regular' // Is it a regular column
        &&
        entity[propertyName] // Does the passed entity have the property
      ){
        cb(propertyName, columnOptions.encrypt)
      }
    }
  })
}

/**
 * Checks the supplied entity for encrypted columns and encrypts any columns that need it.
 * 
 * @param entity Typeorm Entity to check.
 */
export const encrypt = <T extends ObjectLiteral>(entity: T): T => {
  forMatchingColumns(entity, (propertyName, options) => {
    // For any matching columns encrypt the property
    entity[propertyName] = encryptString(entity[propertyName], options)
  })

  return entity
}

/**
 * Encrypts the supplied string with the columns options.
 * 
 * @param string The string to encrypt.
 * @param options The encryption options.
 */
const encryptString = (string: string, options: EncryptionOptions) => {
  const buffer = Buffer.from(string, "utf8")
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
 */
export const decrypt = (entity: ObjectLiteral) => {
  forMatchingColumns(entity, (propertyName, options) => {
    // For any matching columns decrypt the property
    entity[propertyName] = decryptString(entity[propertyName], options)
  })

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