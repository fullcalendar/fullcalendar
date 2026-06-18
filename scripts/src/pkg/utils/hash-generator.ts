import { createHash } from 'crypto'

export class HashGenerator {
  private hashMap: Map<string, string> = new Map()
  private usedHashes: Set<string> = new Set()
  private hashLength: number
  private salt: string

  constructor(hashLength: number, salt: string) {
    this.hashLength = hashLength
    this.salt = salt
  }

  generate(input: string) {
    if (this.hashMap.has(input)) {
      return this.hashMap.get(input)
    }

    const hash = this.generateNew(input)
    this.hashMap.set(input, hash)
    return hash
  }

  generateNew(input: string) {
    let attemptCnt = 0
    let hash

    do {
      hash = this.generateAttempt(input, attemptCnt++)
    } while (this.usedHashes.has(hash))

    this.usedHashes.add(hash)
    return hash
  }

  generateAttempt(input: string, attemptNum: number) {
    if (attemptNum > 100) {
      throw new Error('Too many attempts. Consider increasing hashLength')
    }

    return hashToAlphaNumeric(String(attemptNum) + this.salt + input)
      .substring(0, this.hashLength)
  }
}

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function hashToAlphaNumeric(input: string) {
  const hash = createHash('md5').update(input).digest() // Buffer of 16 bytes
  let num = BigInt('0x' + hash.toString('hex')) // Convert to BigInt


  // Convert to base62
  let result = ''
  while (num > 0n) {
    result += CHARS[Number(num % 62n)]
    num = num / 62n
  }

  return result
}
