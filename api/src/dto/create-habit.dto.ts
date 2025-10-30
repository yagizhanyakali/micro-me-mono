import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}

