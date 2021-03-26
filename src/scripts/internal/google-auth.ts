import { google } from 'googleapis';
import { readText } from '../../utils/file-system';
import {
  Compute,
  BaseExternalAccountClient,
  JWT,
  UserRefreshClient
} from 'google-auth-library';

export const GOOGLE_SCOPES_DRIVE: readonly string[] = [
  'https://www.googleapis.com/auth/drive.readonly'
];

export const GOOGLE_SCOPES_GMAIL: readonly string[] = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

export async function getClient(
  credentialsFilePath: string,
  scopes: readonly string[]
): Promise<Compute | JWT | UserRefreshClient | BaseExternalAccountClient> {
  const credentials = await getCredentials(credentialsFilePath);
  return await google.auth.getClient({
    credentials,
    scopes: [...scopes]
  });
}

export async function getClientJwt(
  credentialsFilePath: string,
  scopes: readonly string[]
): Promise<JWT> {
  const client = new google.auth.JWT({
    keyFile: credentialsFilePath,
    scopes: [...scopes],
    subject: 'goran.mrzljak@gmail.com' // google admin email address to impersonate
  });

  await client.authorize();

  return client;
}

interface Credentials {
  readonly type: string;
  readonly project_id: string;
  readonly private_key_id: string;
  readonly private_key: string;
  readonly client_email: string;
  readonly client_id: string;
  readonly auth_uri: string;
  readonly token_uri: string;
  readonly auth_provider_x509_cert_url: string;
  readonly client_x509_cert_url: string;
}

async function getCredentials(
  credentialsFilePath: string
): Promise<Credentials> {
  const credentialsText = await readText(credentialsFilePath);
  return JSON.parse(credentialsText);
}
