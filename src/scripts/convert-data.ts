import { asChainable } from '../utils/chainable';
import { FigureData } from '../types/figure-data';
import { compareFnNumberAsc, sortArray } from '../utils/array-utils';
import { readText, writeJson } from '../utils/file-system';
import { getFigureData } from './internal/get-figure-data';
import { scriptExecutor } from '../utils/script-executor';
import { FigureDataWithIndexes } from '../types/figure-data-with-indexes';
import { FigureSectionDataWithIndexes } from '../types/figure-section-data-with-indexes';
import { FigureSectionData } from '../types/figure-section-data';

async function convertData(): Promise<void> {
  const figureData = await getFigureData();
  const figureDataHoldIndexesMap = await getFigureDataHoldIndexesMap();

  printHoldErrors(figureData, figureDataHoldIndexesMap);

  const figuresDataWithIndexes = asChainable(figureData)
    .reduce((acc, item) => {
      const key = item.startHold;

      const startHoldIndex = figureDataHoldIndexesMap.get(item.startHold);
      const endHoldIndex = figureDataHoldIndexesMap.get(item.endHold);

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

  await writeJson(figuresData, 'output/figures-data.json');
}

function printHoldErrors(
  figureData: readonly FigureData[],
  figureDataHoldIndexesMap: Map<string, number>
): void {
  const figureDataExistingHoldsSet = new Set<string>();
  figureData.forEach((item) => {
    figureDataExistingHoldsSet.add(item.startHold);
    figureDataExistingHoldsSet.add(item.endHold);
  });

  const figureDataHoldIndexesSet = new Set<string>(
    figureDataHoldIndexesMap.keys()
  );

  const holdsWithMissingIndexes = subtractSets(
    figureDataExistingHoldsSet,
    figureDataHoldIndexesSet
  );
  if (holdsWithMissingIndexes.length > 0) {
    console.error('Hold indexes missing for:');
    console.error(holdsWithMissingIndexes);
  }

  const unknownHoldsInHoldIndexFile = subtractSets(
    figureDataHoldIndexesSet,
    figureDataExistingHoldsSet
  );
  if (unknownHoldsInHoldIndexFile.length > 0) {
    console.error('Unknown holds in hold index file:');
    console.error(unknownHoldsInHoldIndexFile);
  }
}

function subtractSets(
  original: Set<string>,
  subtractor: Set<string>
): readonly string[] {
  return [...original.keys()].filter((item) => !subtractor.has(item));
}

async function getFigureDataHoldIndexesMap(): Promise<Map<string, number>> {
  const figureDataHolds = await readText('./input/figure-data-holds.txt');
  return asChainable(figureDataHolds)
    .apply<readonly string[]>((value) => value.split('\n'))
    .filter((item) => item.trim() !== '')
    .map<string, readonly [string, number]>((hold, index) => [hold, index])
    .apply((value) => new Map<string, number>(value))
    .getValue();
}

scriptExecutor(convertData);
