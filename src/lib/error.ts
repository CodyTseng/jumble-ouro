export function formatError(error: unknown): string[] {
  const errors = error instanceof AggregateError ? error.errors : [error]
  return errors.map((err) => {
    return err instanceof Error ? err.message : String(err)
  })
}
