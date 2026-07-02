import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartSubscriptionCheckoutDto {
  @IsUUID()
  planId: string;

  @IsString()
  customerId: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
