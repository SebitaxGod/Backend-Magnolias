import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly iaServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.iaServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000';
  }

  async evaluarPostulacion(data: {
    cv_url: string;
    respuestas_json: any;
    vacante_id: number;
    requisitos: string;
    skills: any;
  }): Promise<{ puntaje_ia: number; feedback: string }> {
    try {
      this.logger.log(`Evaluando postulación para vacante ${data.vacante_id}`);

      const response = await firstValueFrom(
        this.httpService.post(`${this.iaServiceUrl}/api/evaluar`, data, {
          timeout: 30000,
        }),
      );

      return (response as any).data;
    } catch (error) {
      this.logger.error('Error al evaluar con IA:', error.message);

      // Retornar puntaje por defecto si falla
      return {
        puntaje_ia: 50,
        feedback:
          'Evaluación automática no disponible. Pendiente de revisión manual.',
      };
    }
  }

  async analizarCV(cvUrl: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.iaServiceUrl}/api/analizar-cv`, {
          cv_url: cvUrl,
        }),
      );

      return (response as any).data;
    } catch (error) {
      this.logger.error('Error al analizar CV:', error.message);
      throw error;
    }
  }
}
