import { FigureDataWithIndexes } from './figure-data-with-indexes';

export interface FigureSectionDataWithIndexes {
  readonly startHold: string;
  readonly startHoldIndex: number;
  readonly figures: readonly FigureDataWithIndexes[];
}
