import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

import { Profile } from '../model/profile.model';
import { Job } from '../model/job.model';
import { Contract } from '../model/contract.model';

@Injectable()
export class BalancesService {
  constructor(
    @InjectModel(Profile) private profileModel: typeof Profile,
    private sequelize: Sequelize, // Inject Sequelize for transactions
  ) {}

  async depositBalance(userId: number, amount: number): Promise<Profile> {
    const transaction = await this.sequelize.transaction();

    try {
      const contracts = await Contract.findAll({
        where: {
          ClientId: userId,
        },
        include: {
          model: Job,
          required: true,
          where: { paid: false }, // Filter for unpaid jobs
        },
        transaction,
      });

      if (!contracts.length) {
        throw new Error('No contracts found for this user');
      }

      // Access jobs directly via contracts
      const unpaidJobs = contracts.flatMap((contract) => contract.jobs);
      const totalToPay = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
      const maxDepositAmount = totalToPay * 0.25; //25%

      if (amount > maxDepositAmount) {
        throw new Error(`Deposit cannot exceed 25% of the unpaid jobs total.`);
      }

      // Retrieve the client profile
      const client = await this.profileModel.findByPk(userId, { transaction });
      if (!client) {
        throw new Error('Client not found');
      }

      // Update the balance and save
      client.balance += amount;
      await client.save({ transaction });

      await transaction.commit();

      return client;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
