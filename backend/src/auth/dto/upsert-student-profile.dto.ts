import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertStudentProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  university: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  career: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  cycle: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;
}
