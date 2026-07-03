import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BusinessesRepository } from './businesses.repository';
import { BusinessesService } from './businesses.service';

@Module({
  imports: [DatabaseModule],
  providers: [BusinessesRepository, BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
