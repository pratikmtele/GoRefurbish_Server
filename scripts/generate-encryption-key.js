import crypto from 'crypto';

// Generate a 32-byte (256-bit) random key
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('='.repeat(60));
console.log('ENCRYPTION KEY GENERATOR');
console.log('='.repeat(60));
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('='.repeat(60));
