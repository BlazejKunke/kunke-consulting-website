import { randomBytes } from 'node:crypto';

export function generateNonce(size = 16): string {
  return randomBytes(size).toString('base64');
}
