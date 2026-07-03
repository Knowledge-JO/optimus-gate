import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LedgerRepository } from './ledger.repository';
import { LedgerService } from './ledger.service';

@Module({
  imports: [DatabaseModule],
  providers: [LedgerRepository, LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
