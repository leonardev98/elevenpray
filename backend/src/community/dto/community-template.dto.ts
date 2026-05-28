import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TEMPLATE_CAREERS,
  TEMPLATE_TYPES,
} from '../entities/community-academic-template.entity';

export class CreateAcademicTemplateDto {
  @IsIn([...TEMPLATE_TYPES])
  type: (typeof TEMPLATE_TYPES)[number];

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsIn([...TEMPLATE_CAREERS])
  career: (typeof TEMPLATE_CAREERS)[number];

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsUrl()
  attachmentUrl: string;

  @IsString()
  @IsNotEmpty()
  attachmentName: string;

  @IsInt()
  @Min(1)
  attachmentSizeBytes: number;

  @IsString()
  @IsNotEmpty()
  attachmentMime: string;

  @IsBoolean()
  authorshipConfirmed: boolean;
}

export class PresignTemplateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
