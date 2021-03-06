import fs from 'fs';
import csvParser from 'csv-parser';

export async function readCsv(filePath: string): Promise<readonly string[]> {
  return new Promise<readonly string[]>((resolve, reject) => {
    const results: string[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        console.log(typeof data, data);
        results.push(data);
      })
      .on('end', () => {
        console.log(results.length);
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
