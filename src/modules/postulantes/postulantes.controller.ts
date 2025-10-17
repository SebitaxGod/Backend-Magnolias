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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PostulantesService } from './postulantes.service';
import { CreatePostulanteDto } from './dto/create-postulante.dto';
import { UpdatePostulanteDto } from './dto/update-postulante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Postulantes')
@Controller('Postulantes')
export class PostulantesController {
  constructor(private readonly PostulantesService: PostulantesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo postulante' })
  @ApiResponse({ status: 201, description: 'postulante creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  create(@Body() createPostulanteDto: CreatePostulanteDto) {
    return this.PostulantesService.create(createPostulanteDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del postulante autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del postulante' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getMe(@Request() req) {
    return this.PostulantesService.findOne(req.user.userId);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los Postulantes' })
  findAll() {
    return this.PostulantesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un postulante por ID' })
  @ApiResponse({ status: 200, description: 'postulante encontrado' })
  @ApiResponse({ status: 404, description: 'postulante no encontrado' })
  findOne(@Param('id') id: string) {
    return this.PostulantesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar datos de un postulante' })
  @ApiResponse({ status: 200, description: 'postulante actualizado' })
  update(
    @Param('id') id: string,
    @Body() updatePostulanteDto: UpdatePostulanteDto,
  ) {
    return this.PostulantesService.update(+id, updatePostulanteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar un postulante' })
  remove(@Param('id') id: string) {
    return this.PostulantesService.remove(+id);
  }
}
