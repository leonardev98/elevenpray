import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail({ require_tld: false }, { message: 'Email no válido' })
  email?: string;

  /**
   * `null` permitido explícitamente para que el usuario pueda eliminar su foto
   * de perfil (vuelve a iniciales). Si el campo se omite, no se toca.
   */
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}
