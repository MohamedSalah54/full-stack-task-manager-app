export class UpdateUserDto {
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
    readonly role?: 'user' | 'team-lead' | 'admin';
  }
  