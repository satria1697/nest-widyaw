export type TGender = 'L' | 'P';

export class CreateAuthDto {
  name: string;
  email: string;
  gender: TGender;
  password: string;
}
