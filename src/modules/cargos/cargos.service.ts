import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Injectable()
export class CargoService {
  constructor(private prisma: PrismaService) {}

  async create(createCargoDto: CreateCargoDto, empresaId: number) {
    return this.prisma.cargo.create({
      data: {
        ...createCargoDto,
        idEmpresa: empresaId,
      },
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
    });
  }

  async findAll(estado?: string) {
    const where = estado ? { estado: estado as any } : {};

    return this.prisma.cargo.findMany({
      where,
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
      orderBy: {
        fechaPublicacion: 'desc',
      },
    });
  }

  async findByEmpresa(empresaId: number) {
    return this.prisma.cargo.findMany({
      where: { idEmpresa: empresaId },
      include: {
        _count: {
          select: {
            postulaciones: true,
          },
        },
      },
      orderBy: {
        fechaPublicacion: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const cargo = await this.prisma.cargo.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            descripcion: true,
            logoUrl: true,
          },
        },
        _count: {
          select: {
            postulaciones: true,
          },
        },
      },
    });

    if (!cargo) {
      throw new NotFoundException('Cargo no encontrado');
    }

    return cargo;
  }

  async update(
    id: number,
    updateCargoDto: UpdateCargoDto,
    empresaId: number,
  ) {
    const cargo = await this.findOne(id);

    if (cargo.idEmpresa !== empresaId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este cargo',
      );
    }

    return this.prisma.cargo.update({
      where: { id },
      data: updateCargoDto,
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
    });
  }

  async remove(id: number, empresaId: number) {
    const cargo = await this.findOne(id);

    if (cargo.idEmpresa !== empresaId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este cargo',
      );
    }

    return this.prisma.cargo.update({
      where: { id },
      data: { estado: 'CERRADA' },
    });
  }
}
