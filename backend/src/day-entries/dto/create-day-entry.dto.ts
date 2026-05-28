import { IsIn, IsObject, IsOptional, IsString, Matches } from 'class-validator';
import { DayEntryType } from '../entities/day-entry.entity';

const DAY_ENTRY_TYPES: DayEntryType[] = [
  'checkin',
  'breathing',
  'pomodoro',
  'journal',
  'sos',
];

export class CreateDayEntryDto {
  @IsIn(DAY_ENTRY_TYPES)
  entryType: DayEntryType;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  entryDate?: string;
}
