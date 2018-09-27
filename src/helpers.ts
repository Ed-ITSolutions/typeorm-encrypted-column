import {randomBytes, createCipheriv} from 'crypto'

/**
 * Test the validatity of a key.
 * 
 * @param keyToTest The key to test.
 * @param algorithm The encryption algorithm to test against.
 */
export const validateKey = (keyToTest: string, algorithm: string) => {
  let string = 'validate'

  try{
    const buffer = Buffer.from(string, "utf8")
    const iv = randomBytes(16)
    const key = Buffer.from(keyToTest, 'hex')

    const cipher = createCipheriv(algorithm, key, iv)
    const start = cipher.update(buffer)
    const end = cipher.final()

    Buffer.concat([iv, start, end]).toString('base64')

    return true
  }catch{
    return false
  }
}

/**
 * Creates a new key and validates it.
 * 
 * @param length The length in bytes of the new key.
 * @param algorithm The algorithm to test against (see `validateKey`).
 */
export const createKey = (length: number, algorithm: string) => {
  let key = randomBytes(length)

  if(validateKey(key.toString('hex'), algorithm)){
    return key.toString('hex')
  }else{
    return false
  }
}