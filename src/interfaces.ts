import {ColumnOptions, Column} from 'typeorm'
import {validateKey} from './helpers'
import {getCiphers} from 'crypto'

export interface EncryptedColumnOptions extends ColumnOptions{
  encrypt: EncryptionOptions
}

export interface EncryptionOptions{
  /** Encryption key. */
  key: string
  /** One of the `crypto.getCiphers()` algorithms. */
  algorithm: string
  /** IV Length to use in bytes. */
  ivLength: number
  /** Loose matching skips the column/entity relationship check */
  looseMatching?: boolean
}

export const EncryptedColumn = (options: EncryptedColumnOptions) => {
  if(getCiphers().indexOf(options.encrypt.algorithm) < 0){
    throw "Invalid Algorithm"
  }

  if(!validateKey(options.encrypt.key, options.encrypt.algorithm)){
    throw "Invalid Key"
  }

  if(!options.type){
    options.type = 'varchar'
    options.nullable = false
  }

  return Column(options)
}