import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoDto {
  @ApiProperty({
    example: 'SELECCIONADO',
    enum: ['PENDIENTE', 'EVALUADO', 'RECHAZADO', 'SELECCIONADO'],
  })
  @IsEnum(['PENDIENTE', 'EVALUADO', 'RECHAZADO', 'SELECCIONADO'])
  @IsNotEmpty()
  estado: string;
}
