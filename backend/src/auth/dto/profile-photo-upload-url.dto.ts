import { IsString, IsOptional, Matches } from 'class-validator';

export class ProfilePhotoUploadUrlDto {
  @IsString()
  @Matches(/^image\//, { message: 'contentType must be an image type (e.g. image/jpeg)' })
  contentType: string;

  @IsOptional()
  @IsString()
  filename?: string;
}
