import { Controller, Post, Param, Body } from '@nestjs/common';
import { BalancesService } from 'src/services/balance.service';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Post('deposit/:userId')
  async depositBalance(@Param('userId') userId: number, @Body() depositDto: { amount: number }) {
    return this.balancesService.depositBalance(userId, depositDto.amount);
  }
}
