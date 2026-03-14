import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'La contraseña actual es obligatoria' })
  currentPassword: string;

  @IsString()
  @MinLength(4, { message: 'La nueva contraseña debe tener al menos 4 caracteres' })
  @MaxLength(100)
  newPassword: string;
}
