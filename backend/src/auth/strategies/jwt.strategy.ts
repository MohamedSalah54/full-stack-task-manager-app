import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema'; 

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['jwt'];
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub);


  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  
    return {
      userId: (user._id as Types.ObjectId).toString(), 
      email: user.email,
      role: user.role, 
      team: user.team,

    };
  }
  
}
