import fs, { promises as fsPromises } from 'fs';
import { join } from 'path';

// import { DateTime } from 'luxon';

export async function readText(filePath: string): Promise<string> {
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

export async function writeText(data: string, filePath: string): Promise<void> {
  await fsPromises.writeFile(filePath, data);
}

export async function writeJson(
  data: unknown,
  filePath: string
): Promise<void> {
  await fsPromises.writeFile(
    getProjectRelativePath(filePath),
    JSON.stringify(data, null, 2)
  );
}

export async function writeStringLines(
  data: readonly string[],
  filePath: string
): Promise<void> {
  await writeArrayToFile(data, getProjectRelativePath(filePath));
}

function getProjectRelativePath(path: string): string {
  return join(__dirname, '../../', path);
}

async function writeArrayToFile(
  data: readonly string[],
  filePath: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    let isFirstLine = true;
    writeStream.on('error', (error) => {
      reject(error);
    });
    data.forEach((line) => {
      if (isFirstLine) {
        writeStream.write(line);
        isFirstLine = false;
      } else {
        writeStream.write(`\n${line}`);
      }
    });
    writeStream.end(() => {
      resolve();
    });
  });
}

export async function copyFile(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  const fullSourcePath = getProjectRelativePath(sourcePath);
  const fullDestinationPath = getProjectRelativePath(destinationPath);

  await fsPromises.copyFile(fullSourcePath, fullDestinationPath);
}

// export function getCurrentTimeString(): string {
//   return DateTime.utc().toFormat('yyyy-MM-dd_HH-mm-ss-SSS');
// }
