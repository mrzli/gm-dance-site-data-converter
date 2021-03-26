import { scriptExecutor } from '../utils/script-executor';
import { getClient, GOOGLE_SCOPES_DRIVE } from './internal/google-auth';
import { google, sheets_v4 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import * as csv from 'csv-string';
import { writeText } from '../utils/file-system';
import GSheetsApi = sheets_v4.Sheets;
import GSheetRequest = sheets_v4.Params$Resource$Spreadsheets$Get;
import GSchemaSpreadsheet = sheets_v4.Schema$Spreadsheet;
import GSheetRowData = sheets_v4.Schema$RowData;

async function downloadRawData(): Promise<void> {
  const client = await getClient(
    './secret/client-secret.json',
    GOOGLE_SCOPES_DRIVE
  );

  const sheetsApi: GSheetsApi = google.sheets({ version: 'v4', auth: client });
  const document = await getDocumentData(sheetsApi);
  const visibleData = getVisibleData(document);
  // const csvLines = toCsvLines(visibleData);
  const csvText = csv.stringify(visibleData);

  await writeText(csvText, 'input/raw-data.csv');
}

async function getDocumentData(
  sheetsApi: GSheetsApi
): Promise<GSchemaSpreadsheet> {
  const request: GSheetRequest = {
    spreadsheetId: '1H4fPS0AfD_87tEgrGqze4WexznkNYAAww5y6ED3nUDs',
    includeGridData: true
  };

  const response: GaxiosResponse<GSchemaSpreadsheet> = await sheetsApi.spreadsheets.get(
    request
  );

  return response.data;
}

function getVisibleData(document: GSchemaSpreadsheet): string[][] {
  const sheet = document.sheets?.find(
    (s) => s.properties?.title === 'By Videos'
  );
  const rowData = sheet?.data?.[0].rowData;
  if (rowData === undefined) {
    return [];
  }

  return rowData
    .filter(
      (rowItem) =>
        rowItem.values !== undefined &&
        rowItem.values.some((value) => !!value.formattedValue)
    )
    .map((rowItem) => getRowVisibleData(rowItem));
}

function getRowVisibleData(rowItem: GSheetRowData): string[] {
  if (rowItem.values === undefined) {
    throw new Error('Rows need to be filtered, this is an error');
  }

  return rowItem.values
    .slice(0, 5)
    .map((cellItem) => cellItem.formattedValue ?? '');
}

// function toCsvLines(
//   visibleData: readonly ReadonlyArray<string>[]
// ): readonly string[] {
//   return visibleData.map((visibleDataLine) =>
//     visibleDataLine.map(toCsvString).join(',')
//   );
// }
//
// function toCsvString(value: string): string {
//   return value.includes(',') ? `"${value}"` : value;
// }

scriptExecutor(downloadRawData);
