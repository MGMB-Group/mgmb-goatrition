// Simple deterministic password hashing for demo purposes
export function hashPassword(password: string): string {
  let hash = 5381
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) ^ password.charCodeAt(i)
    hash = hash >>> 0
  }
  return `mgmb_${hash.toString(16)}_${password.length}`
}

export function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed
}
