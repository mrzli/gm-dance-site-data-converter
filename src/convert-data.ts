import { readCsv } from './csv-reader';
import { asChainable } from './utils/chainable';
import { RawEntry } from './types/raw-entry';
import { FigureData } from './types/figure-data';
import { FigureSectionData } from './types/figure-section-data';
import { compareFnStringAsc, sortArray } from './utils/array-utils';
import { writeJsonToOutput } from './utils/file-system';

type FigureDataListTuple = readonly [string, readonly FigureData[]];

async function convertData(): Promise<void> {
  const rawData = await readCsv('./data/raw-data.csv');

  const figureData = asChainable(rawData)
    .filter((item) => item.notAFigure !== 'T')
    .apply<readonly RawEntry[]>((value) => {
      let currentVideo = '';
      return value.map((item) => {
        if (item.video !== '') {
          currentVideo = item.video;
          return item;
        } else {
          return { ...item, video: currentVideo };
        }
      });
    })
    .map<RawEntry, FigureData>((item) => {
      const [startHold, endHold] = getStartAndEndHold(item);

      return {
        description: item.description,
        startHold,
        endHold,
        note: item.note,
        video: item.video
      };
    })
    .getValue();

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

const HOLD_DELIMITER = ' -> ';

function getStartAndEndHold(item: RawEntry): readonly [string, string] {
  return verifyHolds(getStartAndEndHoldInternal(item.holds), item.description);
}

function getStartAndEndHoldInternal(holds: string): readonly [string, string] {
  if (holds.includes(HOLD_DELIMITER)) {
    const [startHold, endHold] = holds.split(HOLD_DELIMITER);
    return [startHold, endHold];
  } else {
    return [holds, holds];
  }
}

function verifyHolds(
  holds: readonly [string, string],
  description: string
): readonly [string, string] {
  if (holds.some((hold) => hold === '' || hold.includes(' '))) {
    throw new Error(`Invalid hold in '${description}'`);
  }

  return holds;
}

convertData()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    console.log('Finished conversion!');
  });
