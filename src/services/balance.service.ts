import { Injectable } from '@nestjs/common';
import { Profile } from '../model/profile.model';
import { Job } from '../model/job.model';
import { Contract } from '../model/contract.model';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class BalancesService {
  constructor(
    @InjectModel(Profile) private profileModel: typeof Profile,
    private sequelize: Sequelize, // Inject Sequelize for transactions
  ) {}

  async depositBalance(userId: number, amount: number): Promise<Profile> {
    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Query Contracts directly within the transaction
      const contracts = await Contract.findAll({
        where: {
          [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
        },
        include: {
          model: Job,
          required: true,
          where: { paid: false }, // Filter for unpaid jobs
        },
        transaction, // Pass the transaction to ensure this operation is part of the transaction
      });

      if (!contracts.length) {
        throw new Error('No contracts found for this user');
      }

      // Access jobs directly via contracts
      const unpaidJobs = contracts.flatMap((contract) => contract.jobs);
      const totalToPay = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
      const maxDepositAmount = totalToPay * 0.25;

      if (amount > maxDepositAmount) {
        throw new Error(`Deposit cannot exceed 25% of the unpaid jobs total.`);
      }

      // Retrieve the client profile within the transaction
      const client = await this.profileModel.findByPk(userId, { transaction });
      if (!client) {
        throw new Error('Client not found');
      }

      // Update the balance and save within the transaction
      client.balance += amount;
      await client.save({ transaction });

      // Commit the transaction if everything is successful
      await transaction.commit();

      return client;
    } catch (error) {
      // If anything goes wrong, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  }
}
