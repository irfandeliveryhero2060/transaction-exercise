import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

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
        throw new HttpException(
          'No contracts found for this user',
          HttpStatus.NOT_FOUND,
        );
      }

      // Access jobs directly via contracts
      const unpaidJobs = contracts.flatMap((contract) => contract.jobs);
      const totalToPay = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
      const maxDepositAmount = totalToPay * 0.25; //25%

      if (amount > maxDepositAmount) {
        throw new HttpException(
          'Deposit cannot exceed 25% of the unpaid jobs total.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Retrieve the client profile
      const client = await this.profileModel.findByPk(userId, { transaction });
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }

      // Update the balance and save
      client.balance += amount;
      await client.save({ transaction });

      await transaction.commit();

      return client;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await transaction.rollback();
      throw new HttpException(
        error.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
