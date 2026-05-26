import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  course?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  university?: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  course?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  university?: string;
}

export class AcceptAnswerDto {
  @IsString()
  answerId: string;
}
