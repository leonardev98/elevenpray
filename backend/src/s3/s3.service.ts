import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>('AWS_REGION') ?? 'us-east-1';
    this.bucket = this.config.get<string>('S3_BUCKET') ?? '';
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      },
      // Evita que la URL pre-firmada exija headers x-amz-checksum-*; el navegador no los envía
      // y el preflight CORS fallaría si el bucket no los tiene en AllowedHeaders.
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }

  /**
   * Returns a presigned URL for uploading a file (PUT) and the public URL of the object.
   * The client must PUT the file with the same Content-Type passed here.
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 3600,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    const commandInput: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    };
    const command = new PutObjectCommand(commandInput);
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { uploadUrl, publicUrl };
  }
}
