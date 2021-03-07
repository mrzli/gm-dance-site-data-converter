class Chainable<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  public apply<U>(this: Chainable<T>, fn: (value: T) => U): Chainable<U> {
    return new Chainable<U>(fn(this.value));
  }

  public map<U, V>(
    this: Chainable<readonly U[]>,
    fn: (item: U, index: number, array: readonly U[]) => V
  ): Chainable<readonly V[]> {
    return new Chainable<readonly V[]>(this.value.map(fn));
  }

  public filter<U>(
    this: Chainable<readonly U[]>,
    predicate: (item: U, index: number, array: readonly U[]) => boolean
  ): Chainable<readonly U[]> {
    return new Chainable<readonly U[]>(this.value.filter(predicate));
  }

  public reduce<U, V>(
    this: Chainable<readonly U[]>,
    callbackFn: (acc: V, item: U, index: number, array: readonly U[]) => V,
    initialValue: V
  ): Chainable<V> {
    return new Chainable<V>(this.value.reduce(callbackFn, initialValue));
  }

  public getValue(): T {
    return this.value;
  }
}

export function asChainable<T>(value: T): Chainable<T> {
  return new Chainable<T>(value);
}
