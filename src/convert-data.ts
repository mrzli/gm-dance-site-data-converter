import { readCsv } from './csv-reader';

async function convertData(): Promise<void> {
  const data = readCsv('./data/raw-data.csv');
  console.log(data);
}

convertData()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    console.log('Finished conversion!');
  });
