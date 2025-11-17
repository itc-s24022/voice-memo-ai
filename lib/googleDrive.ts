// lib/googleDrive.ts
import { google } from 'googleapis';

export async function uploadToGoogleDrive(
  accessToken: string,
  file: Blob,
  filename: string
): Promise<string> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // ファイルをバッファに変換
  const buffer = Buffer.from(await file.arrayBuffer());

  // Google Driveにアップロード
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: ['root'], // ルートフォルダに保存
    },
    media: {
      mimeType: file.type,
      body: buffer,
    },
    fields: 'id, webViewLink',
  });

  // 共有設定（誰でも閲覧可能）
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // ダウンロード用URL
  const fileId = response.data.id!;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export async function listFiles(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType, webViewLink)',
  });

  return response.data.files || [];
}
