import { promises as fs } from 'fs';
import { join } from 'path';
// import { DateTime } from 'luxon';

export async function writeJsonToOutput(
  data: unknown,
  fileName: string
): Promise<void> {
  await fs.writeFile(
    join(__dirname, `../../data/${fileName}.json`),
    JSON.stringify(data, null, 2)
  );
}

// export function getCurrentTimeString(): string {
//   return DateTime.utc().toFormat('yyyy-MM-dd_HH-mm-ss-SSS');
// }
