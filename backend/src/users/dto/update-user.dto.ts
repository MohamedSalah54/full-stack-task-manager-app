export class UpdateUserDto {
  readonly name?: string;
  readonly email?: string;
  readonly role?: 'user' | 'team-lead' | 'admin';
  readonly image?: string; // تأكد إنك بتسمح بتحديث الصورة هنا
}
