import { IsNotEmpty, IsInt, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostulacionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  idVacante: number;

  @ApiProperty({
    example: {
      pregunta_1: 'Tengo 5 años de experiencia con React',
      pregunta_2: 'Sí, he trabajado extensamente con TypeScript',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  respuestasJson?: any;
}
