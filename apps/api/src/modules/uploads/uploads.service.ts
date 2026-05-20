import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private s3 = new S3Client({
    region: process.env.S3_REGION ?? 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! },
  });

  async signUploadUrl(userId: string, filename: string, contentType: string) {
    const ext = filename.split('.').pop() ?? 'bin';
    const key = `u/${userId}/${randomUUID()}.${ext}`;
    const cmd = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: 600 });
    const publicUrl = `${process.env.CDN_BASE_URL}/${key}`;
    return { uploadUrl: url, key, publicUrl, expiresIn: 600 };
  }
}
