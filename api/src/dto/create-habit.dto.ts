import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  emoji?: string;
}

