export type ArrayElement<
  ArrayType extends readonly unknown[]
> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ReadonlyOmit<T, K extends keyof T> = Readonly<Omit<T, K>>;
