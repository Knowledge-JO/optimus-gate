import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { isAxiosError } from 'axios';
import { NombaModule } from '../src/nomba/nomba.module';
import { NombaTransactionService } from '../src/nomba/nomba-transaction.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NombaModule],
})
class VerifyNombaTransactionModule {}

async function main() {
  const orderReference = getOrderReference();

  if (!orderReference) {
    console.error(
      'Usage: npm run nomba:verify-transaction -- <orderReference>',
    );
    console.error(
      '   or: npm run nomba:verify-transaction -- --order-reference <orderReference>',
    );
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(
    VerifyNombaTransactionModule,
    { logger: false },
  );

  try {
    const nombaTransactionService = app.get(NombaTransactionService);
    const response =
      await nombaTransactionService.verifyByOrderReference(orderReference);

    console.log(
      JSON.stringify(
        {
          orderReference,
          response,
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

function getOrderReference() {
  const args = process.argv.slice(2);
  const flagIndex = args.findIndex((arg) =>
    ['--order-reference', '--orderReference', '-o'].includes(arg),
  );

  if (flagIndex >= 0) {
    return args[flagIndex + 1]?.trim();
  }

  return args.find((arg) => !arg.startsWith('-'))?.trim();
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
