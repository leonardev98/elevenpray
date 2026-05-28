import { IsNotEmpty, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

export class ResourceIngestedDto {
  @IsUUID()
  course_id: string;

  @IsUUID()
  class_id: string;

  @IsUUID()
  resource_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  key_url: string;
}
