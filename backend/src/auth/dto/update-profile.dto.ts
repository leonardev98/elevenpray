import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail({ require_tld: false }, { message: 'Email no válido' })
  email?: string;
}
