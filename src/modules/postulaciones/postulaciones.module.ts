import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostulacionesService } from './postulaciones.service';
import { PostulacionesController } from './postulaciones.controller';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [
    IaModule,
    HttpModule, // Agregar HttpModule para hacer requests a n8n
  ],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
  exports: [PostulacionesService],
})
export class PostulacionesModule {}
