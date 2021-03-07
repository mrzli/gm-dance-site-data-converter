import { getFigureData } from './get-figure-data';
import { distinctItems } from '../utils/array-utils';
import { writeStringArrayToOutput } from '../utils/file-system';
import { scriptExecutor } from '../utils/script-executor';

async function exportFigureHolds(): Promise<void> {
  const figureData = await getFigureData();

  const figureDataHolds: readonly string[] = distinctItems([
    ...figureData.map((item) => item.startHold),
    ...figureData.map((item) => item.endHold)
  ]);
  await writeStringArrayToOutput(figureDataHolds, 'figure-data-holds');
}

scriptExecutor(exportFigureHolds);
