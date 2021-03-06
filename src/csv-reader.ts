import fs from 'fs';
import csvParser, { Options } from 'csv-parser';
import { RawEntry } from './types/raw-entry';

const CSV_OPTIONS: Options = {
  headers: ['video', 'description', 'holds', 'note', 'notAFigure']
};

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
