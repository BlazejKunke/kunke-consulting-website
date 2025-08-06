export function generateNonce(): string {
  return crypto.randomUUID();
}