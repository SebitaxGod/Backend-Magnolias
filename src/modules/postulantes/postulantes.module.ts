import { Module } from '@nestjs/common';
import { PostulantesService } from './postulantes.service';
import { PostulantesController } from './postulantes.controller';

@Module({
  controllers: [PostulantesController],
  providers: [PostulantesService],
  exports: [PostulantesService],
})
export class PostulantesModule {}