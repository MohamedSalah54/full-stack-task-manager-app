import { Controller, Post, Get, Body, Res, HttpCode, UseGuards, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './Decorator/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

interface RequestWithUser extends Request {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }
  
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN,UserRole.TEAM_LEAD)
  @Post('create-user')
  createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUserByAdmin(dto);
  }


  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(loginUserDto);
  
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: '/',
    });
  
    return {
      message: 'Login successful',
      user,
    };
  }
  

  @Post('logout')
  @HttpCode(200)
  async logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  
    return res.json({ message: 'Logout successful' });
  }
  

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
    return { message: 'Authenticated', user: req.user };
  }
}
