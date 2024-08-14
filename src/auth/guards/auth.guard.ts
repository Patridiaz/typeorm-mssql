import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No se detecta un token.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SEED });
      const user = await this.authService.findUserById(payload.id);
      if (!user || !user.isActive) throw new UnauthorizedException('Usuario no válido.');
      
      request['user'] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
