import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PostulacionesService } from './postulaciones.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('postulaciones')
@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una postulación' })
  @ApiResponse({ status: 201, description: 'Postulación creada exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya has postulado a esta vacante' })
  create(@Body() createPostulacionDto: CreatePostulacionDto, @Request() req) {
    return this.postulacionesService.create(
      createPostulacionDto,
      req.user.userId,
    );
  }

  @Get('postulante/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones de un postulante' })
  @ApiResponse({ status: 200, description: 'Lista de postulaciones del postulante' })
  findByPostulante(@Param('id') postulanteId: string) {
    return this.postulacionesService.findByPostulante(+postulanteId);
  }

  @Get('cargo/:cargoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones de un cargo específico' })
  @ApiResponse({ status: 200, description: 'Lista de postulaciones para el cargo' })
  findByCargo(@Param('cargoId') cargoId: string) {
    return this.postulacionesService.findByCargo(+cargoId);
  }

  @Get('empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones recibidas por una empresa' })
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.postulacionesService.findByEmpresa(+empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una postulación por ID' })
  findOne(@Param('id') id: string) {
    return this.postulacionesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar postulación (incluye estado)' })
  update(@Param('id') id: string, @Body() updateEstadoDto: any) {
    return this.postulacionesService.update(+id, updateEstadoDto);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de una postulación' })
  updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoDto,
  ) {
    return this.postulacionesService.updateEstado(+id, updateEstadoDto.estado);
  }
}
