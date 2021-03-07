import { asChainable } from '../utils/chainable';
import { FigureData } from '../types/figure-data';
import { FigureSectionData } from '../types/figure-section-data';
import { compareFnStringAsc, sortArray } from '../utils/array-utils';
import { writeJsonToOutput } from '../utils/file-system';
import { getFigureData } from './get-figure-data';
import { scriptExecutor } from '../utils/script-executor';

type FigureDataListTuple = readonly [string, readonly FigureData[]];

async function convertData(): Promise<void> {
  const figureData = await getFigureData();

  const figuresData = asChainable(figureData)
    .reduce((acc, item) => {
      const key = item.startHold;
      if (acc.has(key)) {
        acc.set(key, (acc.get(key) as readonly FigureData[]).concat(item));
      } else {
        acc.set(key, [item]);
      }
      return acc;
    }, new Map<string, readonly FigureData[]>())
    .apply<readonly FigureDataListTuple[]>((value) =>
      Array.from(value.entries())
    )
    .map<FigureDataListTuple, FigureSectionData>((item) => ({
      startHold: item[0],
      figures: item[1]
    }))
    .apply((value) =>
      sortArray(value, (item1, item2) =>
        compareFnStringAsc(item1.startHold, item2.startHold)
      )
    )
    .getValue();

  await writeJsonToOutput(figuresData, 'figures-data');
}

scriptExecutor(convertData);
