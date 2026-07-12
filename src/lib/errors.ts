// Domain-level error. Thrown by domain/services when a business rule is violated.
// Route handlers / server actions catch these and surface the message to the UI
// (they carry user-facing Spanish messages).
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

/** Narrow an unknown caught value to a user-facing message. */
export function toErrorMessage(err: unknown): string {
  if (err instanceof DomainError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Ocurrió un error inesperado.';
}
