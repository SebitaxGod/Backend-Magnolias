import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDto {
  @ApiProperty({ example: '76123456-7' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ example: 'Tech Solutions SA' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'empresa@techsolutions.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({
    example: 'Empresa de tecnología e innovación',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
