export function sortArray<T>(
  array: readonly T[],
  compareFn: (item1: T, item2: T) => number
): readonly T[] {
  return [...array].sort(compareFn);
}

export function sortArrayByStringAsc(
  array: readonly string[]
): readonly string[] {
  return sortArray(array, compareFnStringAsc);
}

export function compareFnNumberAsc(item1: number, item2: number): number {
  return item1 - item2;
}

export function compareFnNumberDesc(item1: number, item2: number): number {
  return item2 - item1;
}

export function compareFnStringAsc(item1: string, item2: string): number {
  return item1.localeCompare(item2, undefined, { sensitivity: 'base' });
}

export function compareFnStringDesc(item1: string, item2: string): number {
  return -compareFnStringAsc(item1, item2);
}
