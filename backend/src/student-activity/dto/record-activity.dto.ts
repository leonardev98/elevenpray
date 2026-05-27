import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class RecordActivityDto {
  @IsIn(['study', 'tasks', 'checkin'])
  type: 'study' | 'tasks' | 'checkin';

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
