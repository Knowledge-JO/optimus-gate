import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { isAxiosError } from 'axios';
import { NombaModule } from '../src/nomba/nomba.module';
import { NombaTransactionService } from '../src/nomba/nomba-transaction.service';

interface FetchArgs {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  cursor?: string;
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NombaModule],
})
class FetchNombaTransactionsModule {}

async function main() {
  const input = getFetchArgs();

  if (!input.dateFrom || !input.dateTo) {
    console.error(
      'Usage: npm run nomba:fetch-transactions -- --date-from <ISO date> --date-to <ISO date> [--limit 100] [--cursor <cursor>]',
    );
    console.error(
      'Fetches transactions for the configured SUB_ACCOUNT_ID.',
    );
    console.error(
      'Example: npm run nomba:fetch-transactions -- --date-from 2026-07-07T00:00:00 --date-to 2026-07-08T00:00:00 --limit 100',
    );
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(
    FetchNombaTransactionsModule,
    { logger: false },
  );

  try {
    const nombaTransactionService = app.get(NombaTransactionService);
    const response =
      await nombaTransactionService.fetchAccountTransactions(input);

    console.log(
      JSON.stringify(
        {
          request: input,
          scope: 'sub_account',
          response,
          resultCount: response.data?.results?.length ?? 0,
          nextCursor: response.data?.cursor ?? '',
        },
        null,
        2,
      ),
    );
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

function getFetchArgs(): FetchArgs {
  const dateFrom = getFlagValue('--date-from') ?? getFlagValue('--dateFrom');
  const dateTo = getFlagValue('--date-to') ?? getFlagValue('--dateTo');
  const cursor = getFlagValue('--cursor');
  const limitValue = getFlagValue('--limit');
  const limit = limitValue ? Number(limitValue) : undefined;

  return {
    dateFrom,
    dateTo,
    cursor,
    ...(Number.isFinite(limit) && limit ? { limit } : {}),
  };
}

function getFlagValue(flag: string) {
  const args = process.argv.slice(2);
  const flagIndex = args.indexOf(flag);

  if (flagIndex < 0) {
    return undefined;
  }

  return args[flagIndex + 1]?.trim();
}

function printError(error: unknown) {
  if (isAxiosError(error)) {
    console.error(
      JSON.stringify(
        {
          message: error.message,
          status: error.response?.status,
          response: error.response?.data,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (error instanceof Error) {
    console.error(error.message);
    return;
  }

  console.error(error);
}

void main();
