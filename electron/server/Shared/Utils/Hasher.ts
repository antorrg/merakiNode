import argon2 from 'argon2'

export class Hasher {
  static async hash(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id
    })
  }

  static async compare(password: string, hash: string) {
    return argon2.verify(hash, password)
  }
}