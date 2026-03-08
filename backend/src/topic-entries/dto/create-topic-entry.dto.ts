import { IsString, IsOptional, IsDateString } from "class-validator";

export class CreateTopicEntryDto {
  @IsDateString()
  entryDate: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateTopicEntryDto {
  @IsDateString()
  @IsOptional()
  entryDate?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
