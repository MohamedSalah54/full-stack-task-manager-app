import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }



  @Get()
  findAll() {
    return this.usersService.getAllUsers();
  }

  @Get('/search')
  async searchUsers(@Query() searchUserDto: SearchUserDto) {
    return this.usersService.searchUsers(searchUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Delete()
  deleteMany(@Body('ids') ids: string[]) {
    return this.usersService.deleteManyUsers(ids);
  }
}
