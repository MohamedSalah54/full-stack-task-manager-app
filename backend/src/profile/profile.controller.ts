import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole } from 'src/auth/schemas/user.schema';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.profileService.getProfileByUserId(userId);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: 'public/uploads/profile',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          console.log('📸 [BACKEND] Uploaded file name generated:', filename);
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          console.log('⚠️ [BACKEND] Rejected file type:', file.originalname);
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (file) {
      console.log('📂 [BACKEND] File received:', file);
      console.log('📍 [BACKEND] File path:', file.path);

      dto.profileImage = `uploads/profile/${file.filename}`;

      console.log(
        '✅ [BACKEND] Profile image path saved to DB:',
        dto.profileImage,
      );
    } else {
      console.log('🚫 [BACKEND] No file uploaded.');
    }

    return this.profileService.updateProfile(userId, dto);
  }
}
