import { readCsv } from './csv-reader';
import { asChainable } from './utils/chainable';
import { RawEntry } from './types/raw-entry';
import { FinalEntry } from './types/final-entry';

async function convertData(): Promise<void> {
  const rawData = await readCsv('./data/raw-data.csv');

  const finalData = asChainable(rawData)
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
    .map<RawEntry, FinalEntry>((item) => {
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

  console.log(finalData);
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
