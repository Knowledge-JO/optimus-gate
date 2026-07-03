import { Module } from '@nestjs/common';
import { BusinessesModule } from '../businesses/businesses.module';
import { DatabaseModule } from '../database/database.module';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysRepository } from './api-keys.repository';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';

@Module({
  imports: [BusinessesModule, DatabaseModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysRepository, ApiKeysService, ApiKeyAuthGuard],
  exports: [ApiKeysService, ApiKeyAuthGuard],
})
export class ApiKeysModule {}
