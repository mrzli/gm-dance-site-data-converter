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

const STRING_COMPARE_OPTIONS: Intl.CollatorOptions = {
  usage: 'sort',
  sensitivity: 'variant'
};

export function compareFnStringAsc(item1: string, item2: string): number {
  return item1.localeCompare(item2, 'hr', STRING_COMPARE_OPTIONS);
}

export function compareFnStringDesc(item1: string, item2: string): number {
  return -compareFnStringAsc(item1, item2);
}

export function distinctItems<TElement>(
  array: readonly TElement[]
): readonly TElement[] {
  const set = new Set<TElement>();

  // using mutable array and forEach for performance
  const finalArray: TElement[] = [];
  array.forEach((item) => {
    if (!set.has(item)) {
      set.add(item);
      finalArray.push(item);
    }
  });

  return finalArray;
}
