import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmpresasService } from '../empresas/empresas.service';
import { PostulantesService } from '../postulantes/postulantes.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private empresasService: EmpresasService,
    private postulantesService: PostulantesService,
  ) {}

  async loginEmpresa(loginDto: LoginDto) {
    const empresa = await this.empresasService.findByEmail(loginDto.correo);

    if (
      !empresa ||
      !(await bcrypt.compare(loginDto.contrasena, empresa.contrasenaHash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: empresa.id, email: empresa.correo, tipo: 'empresa' };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: empresa.id,
        nombre: empresa.nombre,
        correo: empresa.correo,
        tipo: 'empresa',
      },
    };
  }

  async loginPostulante(loginDto: LoginDto) {
    const postulante = await this.postulantesService.findByEmail(loginDto.correo);

    if (
      !postulante ||
      !(await bcrypt.compare(loginDto.contrasena, postulante.contrasenaHash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: postulante.id,
      email: postulante.correo,
      tipo: 'postulante',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: postulante.id,
        nombre: postulante.nombre,
        correo: postulante.correo,
        tipo: 'postulante',
      },
    };
  }

  async validateUser(userId: number, tipo: string) {
    if (tipo === 'empresa') {
      return this.empresasService.findOne(userId);
    } else if (tipo === 'postulante') {
      return this.postulantesService.findOne(userId);
    }
    return null;
  }
}
