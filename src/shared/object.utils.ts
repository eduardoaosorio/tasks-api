export function pickDefined<T extends Record<string, unknown>>(
  source: T,
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
