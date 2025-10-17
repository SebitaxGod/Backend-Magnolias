import { Module } from '@nestjs/common';
import { CargoService } from './cargos.service';
import { CargoController } from './cargos.controller';

@Module({
  controllers: [CargoController],
  providers: [CargoService],
  exports: [CargoService],
})
export class CargoModule {}
