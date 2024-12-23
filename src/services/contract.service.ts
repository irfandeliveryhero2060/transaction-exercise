import { Injectable } from '@nestjs/common';
import { Contract } from '../model/contract.model';
import { Profile } from '../model/profile.model';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';

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
      throw new Error('Contract not found or does not belong to user');
    }
    return contract;
  }

  async getUserContracts(userId: number): Promise<Contract[]> {
    return this.contractModel.findAll({
      where: {
        [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
        status: { [Op.ne]: 'terminated' }, // Exclude terminated contracts
      },
    });
  }
}
