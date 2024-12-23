import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ContractsService } from '../services/contract.service';
import { ContractOwnerGuard } from 'src/infra/guards/contract.own.gaurd';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get(':id')
  @UseGuards(ContractOwnerGuard)
  async getContract(@Param('id') id: number) {
    return this.contractsService.getContractById(id);
  }

  @Get()
  @UseGuards(ContractOwnerGuard)
  async getUserContracts(@Query() query: any) {
    return this.contractsService.getUserContracts(query);
  }
}
