import { IsString, Matches } from 'class-validator';

export class LookupBankAccountDto {
  @IsString()
  @Matches(/^\d{10}$/)
  accountNumber!: string;

  @IsString()
  bankCode!: string;
}
