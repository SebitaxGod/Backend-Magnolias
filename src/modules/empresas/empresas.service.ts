import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    const existente = await this.prisma.empresa.findUnique({
      where: { correo: createEmpresaDto.correo },
    });

    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createEmpresaDto.contrasena, 10);

    const empresa = await this.prisma.empresa.create({
      data: {
        rut: createEmpresaDto.rut,
        nombre: createEmpresaDto.nombre,
        correo: createEmpresaDto.correo,
        contrasenaHash: hashedPassword,
        descripcion: createEmpresaDto.descripcion,
        logoUrl: createEmpresaDto.logoUrl,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasenaHash, ...result } = empresa;
    return result;
  }

  async findAll() {
    return this.prisma.empresa.findMany({
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        descripcion: true,
        logoUrl: true,
        fechaCreacion: true,
        estado: true,
      },
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        descripcion: true,
        logoUrl: true,
        fechaCreacion: true,
        estado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  async findByEmail(correo: string) {
    return this.prisma.empresa.findUnique({
      where: { correo },
    });
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    await this.findOne(id);

    const data: any = { ...updateEmpresaDto };

    if (updateEmpresaDto.contrasena) {
      data.contrasenaHash = await bcrypt.hash(updateEmpresaDto.contrasena, 10);
      delete data.contrasena;
    }

    const empresa = await this.prisma.empresa.update({
      where: { id },
      data,
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        descripcion: true,
        logoUrl: true,
        fechaCreacion: true,
        estado: true,
      },
    });

    return empresa;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.empresa.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
}
