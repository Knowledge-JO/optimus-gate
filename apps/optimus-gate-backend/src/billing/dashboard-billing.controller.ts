import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types';
import { CreatePayoutDto } from '../payouts/dto/create-payout.dto';
import { LookupBankAccountDto } from '../payouts/dto/lookup-bank-account.dto';
import { SavePayoutBankAccountDto } from '../payouts/dto/save-payout-bank-account.dto';
import { PayoutsService } from '../payouts/payouts.service';
import { BillingService } from './billing.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateRefundDto } from './dto/create-refund.dto';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class DashboardBillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly payoutsService: PayoutsService,
  ) {}

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

  @Post('subscriptions/:subscriptionId/cancel')
  cancelSubscription(
    @CurrentUser() user: AuthenticatedUser,
    @Param('subscriptionId') subscriptionId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.billingService.cancelSubscription(
      user.id,
      subscriptionId,
      dto,
    );
  }

  @Get('transactions')
  listTransactions(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardTransactions(user.id);
  }

  @Get('refunds')
  listRefunds(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.listDashboardRefunds(user.id);
  }

  @Post('refunds')
  createRefund(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRefundDto,
  ) {
    return this.billingService.createRefund(user.id, dto);
  }

  @Get('payouts')
  listPayouts(@CurrentUser() user: AuthenticatedUser) {
    return this.payoutsService.listPayouts(user.id);
  }

  @Post('payouts')
  createPayout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePayoutDto,
  ) {
    return this.payoutsService.createPayout(user.id, dto);
  }

  @Get('payouts/banks')
  listPayoutBanks() {
    return this.payoutsService.listBanks();
  }

  @Post('payouts/bank-lookup')
  lookupPayoutBankAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LookupBankAccountDto,
  ) {
    return this.payoutsService.lookupBankAccount(user.id, dto);
  }

  @Get('payouts/bank-accounts')
  listPayoutBankAccounts(@CurrentUser() user: AuthenticatedUser) {
    return this.payoutsService.listBankAccounts(user.id);
  }

  @Post('payouts/bank-accounts')
  savePayoutBankAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SavePayoutBankAccountDto,
  ) {
    return this.payoutsService.saveBankAccount(user.id, dto);
  }

  @Delete('payouts/bank-accounts/:bankAccountId')
  deletePayoutBankAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bankAccountId') bankAccountId: string,
  ) {
    return this.payoutsService.deleteBankAccount(user.id, bankAccountId);
  }

  @Patch('payouts/bank-accounts/:bankAccountId/default')
  setDefaultPayoutBankAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bankAccountId') bankAccountId: string,
  ) {
    return this.payoutsService.setDefaultBankAccount(user.id, bankAccountId);
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
