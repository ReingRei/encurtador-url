import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RlQGV4YW1wbGUuY29tIiwic3ViIjoiY2M5M...',
  })
  accessToken: string;
}
