import fs from 'fs';
import csvParser, { Options } from 'csv-parser';
import { RawEntry } from '../../types/raw-entry';

const CSV_OPTIONS: Options = {
  mapHeaders: csvHeaderMapper
};

const HEADERS: readonly string[] = [
  'video',
  'description',
  'holds',
  'note',
  'notAFigure'
];

function csvHeaderMapper({
  index
}: {
  readonly header: string;
  readonly index: number;
}): string {
  if (index >= 0 && index <= 4) {
    return HEADERS[index];
  } else {
    throw new Error(`Invalid header index: ${index}`);
  }
}

export async function readCsv(filePath: string): Promise<readonly RawEntry[]> {
  return new Promise<readonly RawEntry[]>((resolve, reject) => {
    const results: RawEntry[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser(CSV_OPTIONS))
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
