import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarUsuarioDto {
  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'Maria da Silva',
    maxLength: 255,
    type: 'string',
  })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(255, { message: 'O nome não pode ter mais que 255 caracteres.'})
  nome: string;

  @ApiProperty({
    description: 'Endereço de e-mail único do usuário.',
    example: 'maria.silva@example.com',
    type: 'string',
    format: 'email',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @MaxLength(255, { message: 'O e-mail não pode ter mais que 255 caracteres.'})
  email: string;

  @ApiProperty({
    description: 'Senha do usuário. Deve ter entre 6 e 50 caracteres.',
    example: 'senhaForte123',
    minLength: 6,
    maxLength: 50,
    type: 'string',
    format: 'password',
  })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @MaxLength(50, { message: 'A senha não pode ter mais que 50 caracteres.'})
  senha: string;
}