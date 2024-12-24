import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';

import { Contract, ContractStatus } from '../model/contract.model';
import { Profile } from '../model/profile.model';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract) private contractModel: typeof Contract,
    @InjectModel(Profile) private profileModel: typeof Profile,
  ) {}

  async getContractById(id: number): Promise<Contract> {
    const contract = await this.contractModel.findOne({
      where: { id },
    });
    if (!contract) {
      throw new HttpException(
        'Contract not found or does not belong to user',
        HttpStatus.NOT_FOUND,
      );
    }
    return contract;
  }

  async getUserContracts(userId: number): Promise<Contract[]> {
    return this.contractModel.findAll({
      where: {
        [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
        status: { [Op.ne]: ContractStatus.TERMINATED }, // Exclude terminated contracts
      },
    });
  }
}
