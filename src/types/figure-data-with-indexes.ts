export interface FigureDataWithIndexes {
  readonly description: string;
  readonly startHold: string;
  readonly startHoldIndex: number;
  readonly endHold: string;
  readonly endHoldIndex: number;
  readonly note: string;
  readonly videos: readonly string[];
}
