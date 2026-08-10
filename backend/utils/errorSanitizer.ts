export function sanitizeAuthError(err: unknown, fallbackMessage = 'Authentication failed'): string {
  if (!err) return fallbackMessage;

  const rawMsg = err instanceof Error ? err.message : String(err);

  const sensitivePatterns = [
    /ENOTFOUND/i,
    /postgres/i,
    /prisma/i,
    /tenant/i,
    /ETIMEDOUT/i,
    /ECONNREFUSED/i,
    /database/i,
    /P1000|P1001|P1002|P1003|P1008|P1017/i,
    /connection/i,
    /socket/i,
    /bfjw/i, 
  ];

  const isSensitive = sensitivePatterns.some((pattern) => pattern.test(rawMsg));

  if (isSensitive) {
    console.error('[SECURITY AUDIT - Error Masked]', rawMsg);
    return 'Authentication service is temporarily unavailable. Please try again later.';
  }

  return rawMsg;
}
