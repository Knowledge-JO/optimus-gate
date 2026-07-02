import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { ApiKeyEnvironment } from '../api-keys.types';

export class CreateApiKeyDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsIn(['test', 'live'])
  environment?: ApiKeyEnvironment;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  scopes?: string[];
}
