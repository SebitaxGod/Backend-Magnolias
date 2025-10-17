import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { firstValueFrom } from 'rxjs';
import { IaService } from '../ia/ia.service';

@Injectable()
export class PostulacionesService {
  private readonly n8nWebhookUrl: string;

  constructor(
    private prisma: PrismaService,
    private iaService: IaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Obtener URL de n8n desde variables de entorno
    this.n8nWebhookUrl =
      this.configService.get<string>('N8N_WEBHOOK_URL') ||
      'http://localhost:5678/webhook/analizar-postulacion';
  }

  async create(
    createPostulacionDto: CreatePostulacionDto,
    candidatoId: number,
  ) {
    // Verificar si ya existe postulación
    const existente = await this.prisma.postulacion.findUnique({
      where: {
        idPostulante_idCargo: {
          idPostulante: candidatoId,
          idCargo: createPostulacionDto.idVacante,
        },
      },
    });

    if (existente) {
      throw new ConflictException('Ya has postulado a este cargo');
    }

    // Crear postulación
    const postulacion = await this.prisma.postulacion.create({
      data: {
        idPostulante: candidatoId,
        idCargo: createPostulacionDto.idVacante,
        respuestasJson: createPostulacionDto.respuestasJson,
      },
      include: {
        postulante: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            correo: true,
            cvUrl: true,
            skillsJson: true,
            experienciaAnios: true,
          },
        },
        cargo: {
          select: {
            id: true,
            titulo: true,
            requisitos: true,
            preguntasJson: true,
          },
        },
      },
    });

    // ========================================
    // 🚀 TRIGGER WORKFLOW DE N8N
    // ========================================
    // Llamar al webhook de n8n para análisis avanzado con CV + Respuestas
    this.triggerAnalisisN8n(postulacion.id).catch((err) => {
      console.error('❌ Error al triggear workflow de n8n:', err.message);
      // No bloqueamos la postulación si n8n falla
      // Fallback: usar evaluación con IA antigua
      this.evaluarConIA(postulacion.id).catch((iaErr) => {
        console.error('❌ Error en fallback de IA:', iaErr.message);
      });
    });

    return postulacion;
  }

  private async evaluarConIA(postulacionId: number) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        postulante: true,
        cargo: true,
      },
    });

    if (!postulacion) return;

    try {
      const resultado = await this.iaService.evaluarPostulacion({
        cv_url: postulacion.postulante.cvUrl || '',
        respuestas_json: postulacion.respuestasJson,
        vacante_id: postulacion.idCargo,
        requisitos: postulacion.cargo.requisitos || '',
        skills: postulacion.postulante.skillsJson,
      });

      await this.prisma.postulacion.update({
        where: { id: postulacionId },
        data: {
          puntajeIa: resultado.puntaje_ia,
          feedbackIa: resultado.feedback,
          estado: 'EVALUADO',
        },
      });
    } catch (error) {
      console.error('Error en evaluación IA:', error);
    }
  }

  /**
   * 🚀 NUEVO: Trigger del workflow de n8n para análisis avanzado
   * Este método llama al webhook de n8n que ejecuta el workflow completo:
   * - Obtiene datos de postulación, cargo y postulante
   * - Descarga y analiza el CV con OpenAI
   * - Compara respuestas del formulario con el CV (detección de discrepancias)
   * - Calcula scores de compatibilidad y veracidad
   * - Actualiza la postulación con feedback detallado
   */
  private async triggerAnalisisN8n(postulacionId: number): Promise<void> {
    try {
      console.log(
        `🔔 Triggereando workflow n8n para postulación ID: ${postulacionId}`,
      );
      console.log(`📡 Webhook URL: ${this.n8nWebhookUrl}`);

      // Llamar al webhook de n8n con el ID de la postulación
      const response = await firstValueFrom(
        this.httpService.post(
          this.n8nWebhookUrl,
          { postulacionId },
          {
            timeout: 30000, // 30 segundos timeout
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      console.log(
        `✅ Workflow n8n ejecutado exitosamente para postulación ${postulacionId}`,
      );
      console.log(
        `📊 Score final: ${response.data?.analisis?.scoreFinal || 'N/A'}`,
      );
      console.log(
        `💡 Recomendación: ${response.data?.analisis?.recomendacion || 'N/A'}`,
      );
    } catch (error) {
      console.error(
        `❌ Error al llamar webhook de n8n para postulación ${postulacionId}:`,
        error.message,
      );

      // Si n8n no está disponible o falla, el catch en create() llamará al fallback
      throw error;
    }
  }

  async findByVacante(vacanteId: number) {
    return this.prisma.postulacion.findMany({
      where: { idCargo: vacanteId },
      include: {
        postulante: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            correo: true,
            telefono: true,
            cvUrl: true,
            linkedinUrl: true,
            skillsJson: true,
            experienciaAnios: true,
          },
        },
      },
      orderBy: [{ puntajeIa: 'desc' }, { fechaPostulacion: 'desc' }],
    });
  }

  async findByCandidato(candidatoId: number) {
    return this.prisma.postulacion.findMany({
      where: { idPostulante: candidatoId },
      include: {
        cargo: {
          include: {
            empresa: {
              select: {
                id: true,
                rut: true,
                nombre: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaPostulacion: 'desc',
      },
    });
  }

  async findByEmpresa(empresaId: number) {
    return this.prisma.postulacion.findMany({
      where: {
        cargo: {
          idEmpresa: empresaId,
        },
      },
      include: {
        postulante: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            correo: true,
            telefono: true,
            linkedinUrl: true,
            experienciaAnios: true,
          },
        },
        cargo: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
      orderBy: [{ puntajeIa: 'desc' }, { fechaPostulacion: 'desc' }],
    });
  }

  async findOne(id: number) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id },
      include: {
        postulante: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            correo: true,
            telefono: true,
            cvUrl: true,
            linkedinUrl: true,
            skillsJson: true,
            experienciaAnios: true,
          },
        },
        cargo: {
          include: {
            empresa: {
              select: {
                id: true,
                rut: true,
                nombre: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    return postulacion;
  }

  async updateEstado(id: number, estado: string) {
    // Verificar que existe la postulación
    await this.findOne(id);

    return this.prisma.postulacion.update({
      where: { id },
      data: { estado: estado as any },
    });
  }

  async update(id: number, data: any) {
    try {
      // LOG DEBUG: Ver qué datos llegan
      console.log('🔍 UPDATE - ID:', id);
      console.log('🔍 UPDATE - Data recibida:', JSON.stringify(data, null, 2));

      // Verificar que existe la postulación
      await this.findOne(id);

      // Preparar datos con conversión de tipos correcta
      const updateData: any = {};

      // Convertir puntajeIa a número si viene como string
      if (data.puntajeIa !== undefined && data.puntajeIa !== null) {
        updateData.puntajeIa = Number(data.puntajeIa);
      }

      // feedbackIa como string
      if (data.feedbackIa !== undefined && data.feedbackIa !== null) {
        updateData.feedbackIa = String(data.feedbackIa);
      }

      // estado validado contra el enum
      if (data.estado !== undefined && data.estado !== null) {
        const validEstados = ['PENDIENTE', 'EN_REVISION', 'EVALUADO', 'RECHAZADO', 'SELECCIONADO'];
        if (validEstados.includes(data.estado)) {
          updateData.estado = data.estado;
        } else {
          console.warn(`⚠️ Estado inválido recibido: ${data.estado}, se omite`);
        }
      }

      // Otros campos dinámicos
      if (data.respuestasJson !== undefined) {
        updateData.respuestasJson = data.respuestasJson;
      }

      // LOG DEBUG: Ver qué datos se van a actualizar
      console.log('✅ UPDATE - Datos preparados para Prisma:', JSON.stringify(updateData, null, 2));

      const resultado = await this.prisma.postulacion.update({
        where: { id },
        data: updateData,
      });

      console.log('✅ UPDATE - Resultado de Prisma:', JSON.stringify(resultado, null, 2));

      return resultado;
    } catch (error) {
      console.error(`❌ Error al actualizar postulación ${id}:`, error);
      throw error;
    }
  }
}
