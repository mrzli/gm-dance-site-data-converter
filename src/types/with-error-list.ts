export interface WithErrorList<T> {
  readonly value: T;
  readonly errorList: readonly string[];
}
