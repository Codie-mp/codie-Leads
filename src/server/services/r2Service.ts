import { db } from "../../db/index.js";
import { r2Accounts } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class R2Service {
  /**
   * Retrieves an active R2 account and returns an initialized S3Client
   */
  static async getActiveClient(): Promise<{ client: S3Client; bucketName: string; accountId: string } | null> {
    const activeAccounts = await db.select().from(r2Accounts).where(eq(r2Accounts.isActive, true));
    
    if (activeAccounts.length === 0) {
      return null;
    }

    // Simple random selection for load balancing across the pool
    const selected = activeAccounts[Math.floor(Math.random() * activeAccounts.length)];

    const client = new S3Client({
      region: "auto",
      endpoint: selected.endpoint,
      credentials: {
        accessKeyId: selected.accessKeyId,
        secretAccessKey: selected.secretAccessKey,
      },
    });

    return { client, bucketName: selected.bucketName, accountId: selected.id };
  }

  /**
   * Generate a signed URL for uploading a file
   */
  static async generateUploadUrl(fileName: string, contentType: string): Promise<{ url: string, accountId: string } | null> {
    const r2 = await this.getActiveClient();
    if (!r2) return null;

    const command = new PutObjectCommand({
      Bucket: r2.bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2.client, command, { expiresIn: 3600 });
    return { url, accountId: r2.accountId };
  }

  /**
   * Generate a signed URL for reading a file
   */
  static async generateDownloadUrl(fileName: string, accountId: string): Promise<string | null> {
    const accounts = await db.select().from(r2Accounts).where(eq(r2Accounts.id, accountId));
    if (accounts.length === 0) return null;

    const selected = accounts[0];
    const client = new S3Client({
      region: "auto",
      endpoint: selected.endpoint,
      credentials: {
        accessKeyId: selected.accessKeyId,
        secretAccessKey: selected.secretAccessKey,
      },
    });

    const command = new GetObjectCommand({
      Bucket: selected.bucketName,
      Key: fileName,
    });

    return getSignedUrl(client, command, { expiresIn: 3600 });
  }
}
