import { scriptExecutor } from '../utils/script-executor';
import { getClient, GOOGLE_SCOPES_DRIVE } from './internal/google-auth';
import { google, sheets_v4 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import GSheetRequest = sheets_v4.Params$Resource$Spreadsheets$Get;
import GSchemaSpreadsheet = sheets_v4.Schema$Spreadsheet;
import { writeJson } from '../utils/file-system';

async function exampleGsheet(): Promise<void> {
  const client = await getClient(
    './secret/client-secret.json',
    GOOGLE_SCOPES_DRIVE
  );

  const sheets = google.sheets({ version: 'v4', auth: client });

  const request: GSheetRequest = {
    spreadsheetId: '1H4fPS0AfD_87tEgrGqze4WexznkNYAAww5y6ED3nUDs',
    includeGridData: true
  };

  try {
    const response: GaxiosResponse<GSchemaSpreadsheet> = await sheets.spreadsheets.get(
      request
    );
    // console.log(JSON.stringify(response.data.sheets?.[1], null, 2));
    await writeJson(response.data, 'output/gsheet-data.json');
  } catch (err) {
    console.error(err);
  }
}

scriptExecutor(exampleGsheet);
