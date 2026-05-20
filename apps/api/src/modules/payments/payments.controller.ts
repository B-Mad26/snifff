import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

class CheckoutDto { @IsString() planCode!: string; }

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  subscribe(@CurrentUser() u: AuthUser, @Body() dto: CheckoutDto) {
    return this.payments.createCheckoutSession(u.id, dto.planCode);
  }

  @Post('webhook')
  webhook(@Req() req: Request, @Headers('stripe-signature') sig: string) {
    return this.payments.handleWebhook(req.body as Buffer, sig);
  }
}
