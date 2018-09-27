import {validateKey, createKey} from './helpers'

test('validateKey', () => {
  expect(validateKey('d85117047fd06d3afa79b6e44ee3a52eb426fc24c3a2e3667732e8da0342b4da', 'aes-256-cbc')).toBe(true)
  expect(validateKey('fail', 'aes-256-cbc')).toBe(false)
})

test('createKey', () => {
  let key = createKey(32, 'aes-256-cbc')

  expect(key).not.toBeFalsy()

  key = createKey(31, 'aes-256-cbc')

  expect(key).toBeFalsy()
})