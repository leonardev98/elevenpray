import { IsString, IsIn, IsDateString } from 'class-validator';

const FACE_MODEL_TYPES = ['female', 'male'] as const;

export class CreateSessionDto {
  @IsDateString()
  sessionDate: string;

  @IsString()
  @IsIn(FACE_MODEL_TYPES)
  faceModelType: 'female' | 'male';
}
