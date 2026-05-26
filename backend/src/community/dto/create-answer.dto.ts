import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @MaxLength(5000)
  body: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateAnswerDto {
  @IsString()
  @MaxLength(5000)
  body: string;
}
