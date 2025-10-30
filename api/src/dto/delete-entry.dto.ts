import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class DeleteEntryDto {
  @IsString()
  @IsNotEmpty()
  habitId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date!: string;
}

