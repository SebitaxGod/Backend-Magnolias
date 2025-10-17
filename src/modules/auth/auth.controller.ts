import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/empresa')
  @ApiOperation({ summary: 'Login de empresa' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  loginEmpresa(@Body() loginDto: LoginDto) {
    return this.authService.loginEmpresa(loginDto);
  }

  @Post('login/postulante')
  @ApiOperation({ summary: 'Login de postulante' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  loginPostulante(@Body() loginDto: LoginDto) {
    return this.authService.loginPostulante(loginDto);
  }
}
