import { Controller, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
import { BalancesService } from 'src/services/balance.service';

class DepositDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Post('deposit/:userId')
  async depositBalance(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() depositDto: DepositDto,
  ) {
    return this.balancesService.depositBalance(userId, depositDto.amount);
  }
}
