// One-off script to generate a PBKDF2-SHA256 password hash in the exact
// format used by backend/src/utils/auth.ts hashPassword(), so demo seed
// data can be bootstrapped without a running Worker.
// Usage: node scripts/hash-demo-password.mjs "Demo@1234"
import { pbkdf2Sync, randomBytes } from 'node:crypto'

const password = process.argv[2] || 'Demo@1234'
const ITERATIONS = 100_000
const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')

const toHex = (buf) => Buffer.from(buf).toString('hex')
console.log(`pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(hash)}`)
