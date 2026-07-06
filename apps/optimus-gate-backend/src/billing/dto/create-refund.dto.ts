import {
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRefundDto {
  @IsOptional()
  @IsUUID()
  paymentAttemptId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  providerReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  transactionId?: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  idempotencyKey?: string;
}
