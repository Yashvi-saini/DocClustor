import crypto from 'crypto';

const ITERATIONS = 600000;
const KEY_LEN = 64; // 512 bits
const DIGEST = 'sha512';

export function generateSalt(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function derivePinHash(pin: string, salt: string): Promise<string> {
  const pepper = process.env.CRYPTO_PEPPER;
  if (!pepper) {
    throw new Error('Security Error: CRYPTO_PEPPER environment variable is not defined.');
  }

  return new Promise((resolve, reject) => {
    const combinedPassword = `${pin}:${pepper}`;
    
    crypto.pbkdf2(combinedPassword, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

export function deriveEncryptionKey(pin: string, salt: string): Promise<Buffer> {
  const pepper = process.env.CRYPTO_PEPPER;
  if (!pepper) {
    throw new Error('Security Error: CRYPTO_PEPPER environment variable is not defined.');
  }

  return new Promise((resolve, reject) => {
    const combinedPassword = `${pin}:${pepper}`;
    crypto.pbkdf2(combinedPassword, salt, ITERATIONS, 32, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
}

export function encryptBuffer(buffer: Buffer, key: Buffer): { iv: string; content: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decryptBuffer(encryptedContentHex: string, key: Buffer, ivHex: string, tagHex: string): Buffer {
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedContentHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
