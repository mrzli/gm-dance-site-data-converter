import { asChainable } from '../utils/chainable';
import { FigureData } from '../types/figure-data';
import { FigureSectionData } from '../types/figure-section-data';
import { compareFnNumberAsc, sortArray } from '../utils/array-utils';
import { readAllText, writeJsonToOutput } from '../utils/file-system';
import { getFigureData } from './get-figure-data';
import { scriptExecutor } from '../utils/script-executor';
import { WithErrorList } from '../types/with-error-list';

interface HoldFigureDataTuple {
  readonly hold: string;
  readonly figureDataList: readonly FigureData[];
}

interface HoldIndexFigureDataTuple {
  readonly hold: string;
  readonly holdIndex: number;
  readonly figureDataList: readonly FigureData[];
}

async function convertData(): Promise<void> {
  const figureData = await getFigureData();
  const figureDataHoldsMap = await getFigureDataHoldsMap();

  const figuresDataWithErrors = asChainable(figureData)
    .reduce((acc, item) => {
      const key = item.startHold;
      if (acc.has(key)) {
        acc.set(key, (acc.get(key) as readonly FigureData[]).concat(item));
      } else {
        acc.set(key, [item]);
      }
      return acc;
    }, new Map<string, readonly FigureData[]>())
    .apply<readonly HoldFigureDataTuple[]>((value) =>
      Array.from(value.entries()).map(([hold, figureDataList]) => ({
        hold,
        figureDataList
      }))
    )
    .reduce<
      HoldFigureDataTuple,
      WithErrorList<readonly HoldIndexFigureDataTuple[]>
    >(
      (acc, item) => {
        const holdIndex = figureDataHoldsMap.get(item.hold);
        const errorList =
          holdIndex === undefined
            ? acc.errorList.concat(item.hold)
            : acc.errorList;
        const outputItem: HoldIndexFigureDataTuple = {
          hold: item.hold,
          holdIndex: holdIndex ?? Number.MAX_SAFE_INTEGER,
          figureDataList: item.figureDataList
        };
        return {
          value: acc.value.concat(outputItem),
          errorList
        };
      },
      { value: [], errorList: [] }
    )
    .getValue();

  if (figuresDataWithErrors.errorList.length > 0) {
    console.error(
      'Hold indexes missing for: ',
      figuresDataWithErrors.errorList
    );
  }

  const figuresData = asChainable(figuresDataWithErrors.value)
    .apply<readonly HoldIndexFigureDataTuple[]>((value) =>
      sortArray(value, (item1, item2) =>
        compareFnNumberAsc(item1.holdIndex, item2.holdIndex)
      )
    )
    .map<HoldIndexFigureDataTuple, FigureSectionData>((item) => ({
      startHold: item.hold,
      figures: item.figureDataList
    }))
    .getValue();

  await writeJsonToOutput(figuresData, 'figures-data');
}

async function getFigureDataHoldsMap(): Promise<Map<string, number>> {
  const figureDataHolds = await readAllText('./input/figure-data-holds.txt');
  return asChainable(figureDataHolds)
    .apply<readonly string[]>((value) => value.split('\n'))
    .map<string, readonly [string, number]>((hold, index) => [hold, index])
    .apply((value) => new Map<string, number>(value))
    .getValue();
}

scriptExecutor(convertData);
