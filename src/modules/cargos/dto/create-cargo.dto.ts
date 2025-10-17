import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoContrato, Modalidad } from '@prisma/client';

export class CreateCargoDto {
  @ApiProperty({ example: 'Desarrollador Full Stack' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    example: 'Buscamos desarrollador con experiencia en React y Node.js',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 'FULL_TIME', enum: TipoContrato })
  @IsEnum(TipoContrato)
  @IsNotEmpty()
  tipoContrato: TipoContrato;

  @ApiProperty({ example: 'Santiago, Chile' })
  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @ApiProperty({ example: 'REMOTO', enum: Modalidad })
  @IsEnum(Modalidad)
  @IsNotEmpty()
  modalidad: Modalidad;

  @ApiProperty({ example: 1500000, required: false })
  @IsNumber()
  @IsOptional()
  salarioEstimado?: number;

  @ApiProperty({
    example: [
      { pregunta: '¿Cuántos años de experiencia tienes con React?' },
      { pregunta: '¿Has trabajado con TypeScript?' },
    ],
    required: false,
  })
  @IsObject()
  @IsOptional()
  preguntasJson?: any;

  @ApiProperty({
    example: '3+ años experiencia, React, Node.js, TypeScript',
    required: false,
  })
  @IsString()
  @IsOptional()
  requisitos?: string;

  @ApiProperty({ example: '2025-12-31T23:59:59Z', required: false })
  @IsOptional()
  fechaCierre?: Date;
}
