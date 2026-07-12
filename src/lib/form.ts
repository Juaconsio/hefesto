// Shared shape returned by server actions to client forms (via useActionState).
export type FormState = { error?: string; message?: string };

export const emptyFormState: FormState = {};

/** Read an optional trimmed string from FormData; '' becomes null. */
export function optionalString(value: FormDataEntryValue | null): string | null {
  const s = typeof value === 'string' ? value.trim() : '';
  return s === '' ? null : s;
}

/** Read a required string from FormData (may be empty; domain validates). */
export function requiredString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}
