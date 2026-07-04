import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class VerifyCheckoutOrdersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orderReferences!: string[];
}
