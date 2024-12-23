import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
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
  async getUserContracts(@Request() req) {
    const userProfile = req.profile;
    return this.contractsService.getUserContracts(userProfile.id);
  }
}
