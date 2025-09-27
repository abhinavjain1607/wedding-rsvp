import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";

const bucketName = process.env.GCS_BUCKET_NAME;
const projectId = process.env.GCS_PROJECT_ID;
const keyBase64 = process.env.GCS_KEY_BASE64;
const uploadPrefix = process.env.GCS_UPLOAD_PREFIX || "";

let credentials;
if (keyBase64) {
  try {
    credentials = JSON.parse(
      Buffer.from(keyBase64, "base64").toString("utf-8")
    );
  } catch (err) {
    throw new Error("Invalid GCS_KEY_BASE64: " + err);
  }
}

const storage = new Storage({ projectId, credentials });

export async function uploadFileToGCS(
  localFilePath: string,
  destFileName: string
): Promise<string> {
  if (!bucketName) throw new Error("GCS_BUCKET_NAME env variable not set");
  const bucket = storage.bucket(bucketName);
  const fullDestFileName = path.posix.join(uploadPrefix, destFileName);

  // Upload file to GCS (bucket should have public access configured via IAM/bucket policy)
  await bucket.upload(localFilePath, {
    destination: fullDestFileName,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  // Remove local file after successful upload
  fs.unlinkSync(localFilePath);

  // Return public URL
  return `https://storage.googleapis.com/${bucketName}/${fullDestFileName}`;
}
