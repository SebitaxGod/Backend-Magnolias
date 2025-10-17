import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePostulanteDto } from './dto/create-postulante.dto';
import { UpdatePostulanteDto } from './dto/update-postulante.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PostulantesService {
  constructor(private prisma: PrismaService) {}

  async create(createPostulanteDto: CreatePostulanteDto) {
    const existente = await this.prisma.postulante.findUnique({
      where: { correo: createPostulanteDto.correo },
    });

    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createPostulanteDto.contrasena, 10);

    const postulante = await this.prisma.postulante.create({
      data: {
        rut: createPostulanteDto.rut,
        nombre: createPostulanteDto.nombre,
        correo: createPostulanteDto.correo,
        contrasenaHash: hashedPassword,
        telefono: createPostulanteDto.telefono,
        linkedinUrl: createPostulanteDto.linkedinUrl,
        skillsJson: createPostulanteDto.skillsJson,
        experienciaAnios: createPostulanteDto.experienciaAnios,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasenaHash, ...result } = postulante;
    return result;
  }

  async findAll() {
    return this.prisma.postulante.findMany({
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
        fechaRegistro: true,
        estado: true,
      },
    });
  }

  async findOne(id: number) {
    const postulante = await this.prisma.postulante.findUnique({
      where: { id },
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
        fechaRegistro: true,
        estado: true,
      },
    });

    if (!postulante) {
      throw new NotFoundException('Postulante no encontrado');
    }

    return postulante;
  }

  async findByEmail(correo: string) {
    return this.prisma.postulante.findUnique({
      where: { correo },
    });
  }

  async update(id: number, updatePostulanteDto: UpdatePostulanteDto) {
    await this.findOne(id);

    const data: any = { ...updatePostulanteDto };

    if (updatePostulanteDto.contrasena) {
      data.contrasenaHash = await bcrypt.hash(
        updatePostulanteDto.contrasena,
        10,
      );
      delete data.contrasena;
    }

    const postulante = await this.prisma.postulante.update({
      where: { id },
      data,
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
        fechaRegistro: true,
        estado: true,
      },
    });

    return postulante;
  }

  async updateCvUrl(id: number, cvUrl: string) {
    return this.prisma.postulante.update({
      where: { id },
      data: { cvUrl },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.postulante.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
}
