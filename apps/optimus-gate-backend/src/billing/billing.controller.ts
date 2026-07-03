import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentApiKey } from '../api-keys/decorators/current-api-key.decorator';
import type { AuthenticatedApiKey } from '../api-keys/api-keys.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { BillingService } from './billing.service';
import { StartSubscriptionCheckoutDto } from './dto/start-subscription-checkout.dto';
import { ApiKeyOrJwtAuthGuard } from './guards/api-key-or-jwt-auth.guard';

@UseGuards(ApiKeyOrJwtAuthGuard)
@Controller('v1')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout/subscriptions/start')
  startSubscriptionCheckout(
    @CurrentApiKey() apiKey: AuthenticatedApiKey | undefined,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: StartSubscriptionCheckoutDto,
  ) {
    if (apiKey) {
      return this.billingService.startSubscriptionCheckout(apiKey, dto);
    }

    if (user) {
      return this.billingService.startSubscriptionCheckoutForUser(user.id, dto);
    }

    throw new UnauthorizedException('API key or JWT is required');
  }

  @Get('checkout/orders/:orderReference')
  verifyCheckoutOrder(@Param('orderReference') orderReference: string) {
    return this.billingService.verifyCheckoutOrder(orderReference);
  }
}
