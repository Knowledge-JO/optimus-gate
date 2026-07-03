import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types';
import { BillingService } from './billing.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class DashboardBillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('dashboard/stats')
  getDashboardStats(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getDashboardStats(user.id);
  }

  @Get('plans')
  listPlans(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardPlans(user.id);
  }

  @Post('plans')
  createPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePlanDto,
  ) {
    return this.billingService.createPlan(user.id, dto);
  }

  @Get('subscribers')
  listSubscribers(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardSubscribers(user.id);
  }

  @Get('subscriptions')
  listSubscriptions(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardSubscriptions(user.id);
  }

  @Get('transactions')
  listTransactions(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardTransactions(user.id);
  }

  @Get('refunds')
  listRefunds(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardRefunds(user.id);
  }

  @Get('payouts')
  listPayouts(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardPayouts(user.id);
  }

  @Get('subaccounts')
  listSubaccounts(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardSubaccounts(user.id);
  }

  @Get('onboarding/checklist')
  getOnboardingChecklist(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getOnboardingChecklist(user.id);
  }
}
