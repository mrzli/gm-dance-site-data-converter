import { scriptExecutor } from '../utils/script-executor';
import { getClientJwt, GOOGLE_SCOPES_GMAIL } from './internal/google-auth';
import { gmail_v1, google } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import GGmailRequestList = gmail_v1.Params$Resource$Users$Messages$List;
import GListMessagesResponse = gmail_v1.Schema$ListMessagesResponse;
import { writeJson } from '../utils/file-system';

async function example(): Promise<void> {
  const client = await getClientJwt(
    './secret/client-secret.json',
    GOOGLE_SCOPES_GMAIL
  );

  const gmail = google.gmail({ version: 'v1', auth: client });

  const request: GGmailRequestList = {
    userId: 'me'
  };

  try {
    const response: GaxiosResponse<GListMessagesResponse> = await gmail.users.messages.list(
      request
    );
    // console.log(JSON.stringify(response.data, null, 2));
    await writeJson(response.data, 'output/gmail-data.json');
  } catch (err) {
    console.error(err);
  }
}

scriptExecutor(example);
