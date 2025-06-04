import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUsuarioDto {
  @ApiProperty({
    description: 'Endereço de e-mail do usuário para login.',
    example: 'maria.silva@example.com',
  })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário para login.',
    example: 'senhaForte123',
    type: 'string',
    format: 'password',
  })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  senha: string;
}
