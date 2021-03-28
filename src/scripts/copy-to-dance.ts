import { scriptExecutor } from '../utils/script-executor';
import { copyFile } from '../utils/file-system';

async function copyToDance(): Promise<void> {
  await copyFile(
    'output/figures-data.json',
    '../gm-dance-site/src/data/figures-data.json'
  );
}

scriptExecutor(copyToDance);
