import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
  IsInt,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostulanteDto {
  @ApiProperty({ example: '12345678-9' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'candidato@example.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({ example: '+569 1234 5678', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({
    example: 'https://linkedin.com/in/juanperez',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({
    example: { skills: ['JavaScript', 'React', 'Node.js'] },
    required: false,
  })
  @IsObject()
  @IsOptional()
  skillsJson?: any;

  @ApiProperty({ example: 3, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  experienciaAnios?: number;
}
