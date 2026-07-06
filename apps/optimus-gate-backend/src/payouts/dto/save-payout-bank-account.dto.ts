import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class SavePayoutBankAccountDto {
  @IsString()
  @Matches(/^\d{10}$/)
  accountNumber!: string;

  @IsString()
  bankCode!: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
