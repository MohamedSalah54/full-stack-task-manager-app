import { Injectable,  UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      console.log('JWT ERROR:', err);
      console.log('JWT USER:', user);
      throw new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}