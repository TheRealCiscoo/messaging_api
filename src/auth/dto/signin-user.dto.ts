import { IsString } from 'class-validator';

export class SignInUserDto {
  @IsString()
  identityValue!: string;

  @IsString()
  password!: string;
}
