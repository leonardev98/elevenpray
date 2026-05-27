import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PresignStudyPdfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  contentType: string;
}

export class IngestStudyPdfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  s3Key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  mimeType?: string;
}

export class StudyChatMessageDto {
  @IsIn(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @IsString()
  @IsNotEmpty()
  @MaxLength(16000)
  content: string;
}

export class StudyChatDto {
  @IsUUID()
  documentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyChatMessageDto)
  messages: StudyChatMessageDto[];

  @IsOptional()
  @IsBoolean()
  ragEnabled?: boolean;
}

export class GenerateStudyContentDto {
  @IsUUID()
  documentId: string;

  @IsIn(['flashcards', 'quiz', 'summary'])
  type: 'flashcards' | 'quiz' | 'summary';
}
