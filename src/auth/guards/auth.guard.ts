import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.method === 'OPTIONS') {
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No se detecta un token.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SEED });
      
      // 🛑 CORRECCIÓN CRÍTICA AQUÍ:
      // El ID suele venir en 'sub' (Subject). Si 'id' no existe, usamos 'sub'.
      const userId = payload.sub || payload.id; 

      // 🛑 SEGURIDAD EXTRA:
      // Si userId es undefined, lanzamos error INMEDIATAMENTE.
      // Si no hacemos esto, findUserById(undefined) podría devolver al primer usuario (ADMIN 2051).
      if (!userId) {
          console.error('[AuthGuard] Token decodificado sin ID:', payload);
          throw new UnauthorizedException('Token corrupto: No contiene ID de usuario');
      }

      const user = await this.authService.findUserById(userId);
      
      if (!user || !user.isActive) throw new UnauthorizedException('Usuario no válido.');
      
      request['user'] = user;
      return true;
    } catch (error) {
      console.error('[AuthGuard] Error de validación:', error.message);
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'] || request.headers['Authorization']; // Soporte para mayúscula/minúscula
    const [type, token] = (authHeader as string)?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}