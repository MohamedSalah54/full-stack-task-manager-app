import { Controller, Post, Get, Body, Res, HttpCode, UseGuards, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ScrapingService } from '../scraping/scraping.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: any; 
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const token = await this.authService.register(createUserDto);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    if (createUserDto.linkedinUrl) {
      try {
        const linkedinData = await this.scrapingService.scrapeLinkedin(createUserDto.linkedinUrl);
        const user = await this.authService.findByEmail(createUserDto.email);
        if (user) {
          await this.authService.updateUserProfile(user.id, linkedinData);
        }
      } catch (error) {
        console.error('Error scraping LinkedIn data:', error);
      }
    }

    return res.status(201).json({ message: 'User registered successfully' });
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const token = await this.authService.login(loginUserDto);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ message: 'Login successful' });
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
    console.log('User from JWT:', req.user);
    return { message: 'Authenticated', user: req.user };
  }
}
