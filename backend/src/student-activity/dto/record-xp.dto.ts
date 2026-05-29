import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class RecordXpDto {
  @IsInt()
  @Min(1)
  @Max(5000)
  amount: number;

  @IsString()
  @MaxLength(64)
  source: string;
}
