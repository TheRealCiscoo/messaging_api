import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterNewUserDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) =>
    String(value)
      .split(' ')
      .map((word) => {
        const firstLetter = word.split('')[0].toUpperCase();
        return `${firstLetter}${word.split('').slice(1).join('')}`;
      })
      .join(' '),
  )
  firstname!: string;

  @IsString()
  @MinLength(3)
  @Transform(({ value }) =>
    String(value)
      .split(' ')
      .map((word) => {
        const firstLetter = word.split('')[0].toUpperCase();
        return `${firstLetter}${word.split('').slice(1).join('')}`;
      })
      .join(' '),
  )
  lastname!: string;

  @IsString()
  @IsEmail()
  @MinLength(3)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email!: string;

  @IsString()
  @IsStrongPassword({
    minLength: 12,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password!: string;

  @IsInt()
  phone!: number;

  @IsInt()
  phoneCode!: number;

  @IsString()
  @MinLength(3)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  state!: string;

  @IsString()
  @MinLength(3)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  country!: string;

  @IsString()
  @MinLength(2)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  lang!: string;
}
