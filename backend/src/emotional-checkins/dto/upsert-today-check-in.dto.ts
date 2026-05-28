import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const MOODS = ['excellent', 'good', 'normal', 'low', 'bad'] as const;

const FACTORS = [
  'sleepGood',
  'sleepBad',
  'examNear',
  'heavyLoad',
  'calmDay',
  'personalIssues',
  'exercise',
] as const;

export class UpsertTodayCheckInDto {
  @IsIn(MOODS)
  mood: (typeof MOODS)[number];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsIn(FACTORS, { each: true })
  factors?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
