import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CargoService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cargos')
@Controller('cargos')
export class CargoController {
  constructor(private readonly cargosService: CargoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva cargo' })
  @ApiResponse({ status: 201, description: 'cargo creada exitosamente' })
  create(@Body() createCargoDto: CreateCargoDto, @Request() req) {
    return this.cargosService.create(createCargoDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cargos activas' })
  @ApiQuery({ name: 'estado', required: false })
  findAll(@Query('estado') estado?: string) {
    return this.cargosService.findAll(estado);
  }

  @Get('empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener cargos de una empresa' })
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.cargosService.findByEmpresa(+empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cargo por ID' })
  @ApiResponse({ status: 200, description: 'cargo encontrada' })
  @ApiResponse({ status: 404, description: 'cargo no encontrada' })
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una cargo' })
  update(
    @Param('id') id: string,
    @Body() updateCargoDto: UpdateCargoDto,
    @Request() req,
  ) {
    return this.cargosService.update(+id, updateCargoDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar una cargo' })
  remove(@Param('id') id: string, @Request() req) {
    return this.cargosService.remove(+id, req.user.userId);
  }
}
