import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ApplyReferralDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code: string;
}
