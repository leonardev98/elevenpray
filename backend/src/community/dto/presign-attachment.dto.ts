import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class PresignAttachmentDto {
  @IsString()
  @Matches(/^(application\/pdf|image\/(jpeg|png|webp|gif))$/, {
    message: 'contentType must be application/pdf or image/(jpeg|png|webp|gif)',
  })
  contentType: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  filename?: string;
}
