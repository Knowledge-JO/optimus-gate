import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentApiKey } from '../api-keys/decorators/current-api-key.decorator';
import { ApiKeyAuthGuard } from '../api-keys/guards/api-key-auth.guard';
import type { AuthenticatedApiKey } from '../api-keys/api-keys.types';
import { BillingService } from './billing.service';
import { StartSubscriptionCheckoutDto } from './dto/start-subscription-checkout.dto';

@UseGuards(ApiKeyAuthGuard)
@Controller('v1')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout/subscriptions/start')
  startSubscriptionCheckout(
    @CurrentApiKey() apiKey: AuthenticatedApiKey,
    @Body() dto: StartSubscriptionCheckoutDto,
  ) {
    return this.billingService.startSubscriptionCheckout(apiKey, dto);
  }

  @Get('checkout/orders/:orderReference')
  verifyCheckoutOrder(@Param('orderReference') orderReference: string) {
    return this.billingService.verifyCheckoutOrder(orderReference);
  }
}
