import fs, { promises as fsPromises } from 'fs';
import { join } from 'path';

// import { DateTime } from 'luxon';

export async function readAllText(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data.toString());
    });
  });
}

export async function writeJson(
  data: unknown,
  folder: string,
  fileName: string
): Promise<void> {
  await fsPromises.writeFile(
    getFilePath(folder, fileName, 'json'),
    JSON.stringify(data, null, 2)
  );
}

export async function writeStringArray(
  data: readonly string[],
  folder: string,
  fileName: string
): Promise<void> {
  await writeArrayToFile(data, getFilePath(folder, fileName, 'txt'));
}

function getFilePath(
  folder: string,
  fileName: string,
  extension: string
): string {
  return join(__dirname, `../../${folder}/${fileName}.${extension}`);
}

async function writeArrayToFile(
  data: readonly string[],
  path: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(path);
    writeStream.on('error', (error) => {
      reject(error);
    });
    data.forEach((line) => {
      writeStream.write(`${line}\n`);
    });
    writeStream.end(() => {
      resolve();
    });
  });
}

// export function getCurrentTimeString(): string {
//   return DateTime.utc().toFormat('yyyy-MM-dd_HH-mm-ss-SSS');
// }
