interface Array<T> {
  findLast(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined
}

interface PromiseConstructor {
  any<T>(promises: Array<T | PromiseLike<T>>): Promise<T>
}

interface AggregateError extends Error {
  errors: any[]
}

declare const AggregateError: {
  prototype: AggregateError
  new (errors: any[], message?: string): AggregateError
}
