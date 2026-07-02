import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types';
import { BillingService } from './billing.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class DashboardBillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('plans')
  createPlan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePlanDto,
  ) {
    return this.billingService.createPlan(user.id, dto);
  }
}
