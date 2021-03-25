import { getFigureData } from './internal/get-figure-data';
import { distinctItems, sortArrayByStringAsc } from '../utils/array-utils';
import { writeStringArray } from '../utils/file-system';
import { scriptExecutor } from '../utils/script-executor';
import { asChainable } from '../utils/chainable';

async function exportFigureHolds(): Promise<void> {
  const figureData = await getFigureData();

  const figureDataHolds: readonly string[] = [
    ...figureData.map((item) => item.startHold),
    ...figureData.map((item) => item.endHold)
  ];

  const finalFigureDataHolds = asChainable(figureDataHolds)
    .apply((value) => distinctItems(value))
    .apply(sortArrayByStringAsc)
    .getValue();

  await writeStringArray(finalFigureDataHolds, 'output', 'figure-data-holds');
}

scriptExecutor(exportFigureHolds);
