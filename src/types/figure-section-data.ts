import { FigureData } from './figure-data';

export interface FigureSectionData {
  readonly startHold: string;
  readonly figures: readonly FigureData[];
}
