import { asChainable } from '../utils/chainable';
import { FigureData } from '../types/figure-data';
import { compareFnNumberAsc, sortArray } from '../utils/array-utils';
import { readAllText, writeJsonToOutput } from '../utils/file-system';
import { getFigureData } from './get-figure-data';
import { scriptExecutor } from '../utils/script-executor';
import { FigureDataWithIndexes } from '../types/figure-data-with-indexes';
import { FigureSectionDataWithIndexes } from '../types/figure-section-data-with-indexes';
import { FigureSectionData } from '../types/figure-section-data';

async function convertData(): Promise<void> {
  const figureData = await getFigureData();
  const figureDataHoldsMap = await getFigureDataHoldsMap();

  const holdsWithMissingIndexes = new Set<string>();

  const figuresDataWithIndexes = asChainable(figureData)
    .reduce((acc, item) => {
      const key = item.startHold;

      const startHoldIndex = figureDataHoldsMap.get(item.startHold);
      if (startHoldIndex === undefined) {
        holdsWithMissingIndexes.add(item.startHold);
      }
      const endHoldIndex = figureDataHoldsMap.get(item.endHold);
      if (endHoldIndex === undefined) {
        holdsWithMissingIndexes.add(item.endHold);
      }

      const processedItem: FigureDataWithIndexes = {
        ...item,
        startHoldIndex: startHoldIndex ?? Number.MAX_SAFE_INTEGER,
        endHoldIndex: endHoldIndex ?? Number.MAX_SAFE_INTEGER
      };
      if (acc.has(key)) {
        acc.set(
          key,
          (acc.get(key) as readonly FigureDataWithIndexes[]).concat(
            processedItem
          )
        );
      } else {
        acc.set(key, [processedItem]);
      }
      return acc;
    }, new Map<string, readonly FigureDataWithIndexes[]>())
    .apply<readonly FigureSectionDataWithIndexes[]>((value) =>
      Array.from(value.values()).map((value) => {
        return {
          startHold: value[0].startHold,
          startHoldIndex: value[0].startHoldIndex,
          figures: value
        };
      })
    )
    .apply<readonly FigureSectionDataWithIndexes[]>((value) =>
      sortArray(value, (item1, item2) =>
        compareFnNumberAsc(item1.startHoldIndex, item2.startHoldIndex)
      )
    )
    .map<FigureSectionDataWithIndexes, FigureSectionDataWithIndexes>((item) => {
      const sortedFigures = asChainable(item.figures)
        .apply<readonly FigureDataWithIndexes[]>((value) =>
          sortArray(value, (item1, item2) =>
            compareFnNumberAsc(item1.endHoldIndex, item2.endHoldIndex)
          )
        )
        .getValue();

      return {
        ...item,
        figures: sortedFigures
      };
    })
    .getValue();

  if (holdsWithMissingIndexes.size > 0) {
    console.error(
      'Hold indexes missing for: ',
      Array.from(holdsWithMissingIndexes)
    );
  }

  const figuresData = figuresDataWithIndexes.map<FigureSectionData>(
    (section) => {
      return {
        startHold: section.startHold,
        figures: section.figures.map<FigureData>((figure) => ({
          description: figure.description,
          startHold: figure.startHold,
          endHold: figure.endHold,
          note: figure.note,
          videos: figure.videos
        }))
      };
    }
  );

  await writeJsonToOutput(figuresData, 'figures-data');
}

async function getFigureDataHoldsMap(): Promise<Map<string, number>> {
  const figureDataHolds = await readAllText('./input/figure-data-holds.txt');
  return asChainable(figureDataHolds)
    .apply<readonly string[]>((value) => value.split('\n'))
    .filter((item) => item.trim() !== '')
    .map<string, readonly [string, number]>((hold, index) => [hold, index])
    .apply((value) => new Map<string, number>(value))
    .getValue();
}

scriptExecutor(convertData);
