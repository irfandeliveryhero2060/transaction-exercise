import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Job } from '../model/job.model';
import { Profile } from '..//model/profile.model';
import { Contract, ContractStatus } from '../model/contract.model';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job) private jobModel: typeof Job,
    @InjectModel(Profile) private profileModel: typeof Profile,
    private sequelize: Sequelize, // Inject Sequelize for transactions
  ) {}

  async getUnpaidJobs(userId: number): Promise<Job[]> {
    return this.jobModel.findAll({
      where: { paid: false },
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
            status: { [Op.ne]: ContractStatus.TERMINATED },
          },
        },
      ],
    });
  }

  async payForJob(jobId: number, userId: number): Promise<Job> {
    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      const job = await this.jobModel.findOne({
        where: {
          id: jobId,
          paid: false,
        },
        transaction,
        include: [
          {
            model: Contract,
            where: {
              ClientId: userId,
              status: { [Op.ne]: ContractStatus.TERMINATED },
            },
          },
        ],
        lock: transaction.LOCK.UPDATE,
      });

      if (!job) {
        throw new HttpException(
          'Job not found or does not belong to the user',
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch the client profile
      const client = await this.profileModel.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }

      if (client.balance < job.price) {
        throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      // Fetch the contractor profile
      const contractor = await this.profileModel.findByPk(
        job.contract.ContractorId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE,
        },
      );

      if (!contractor) {
        throw new HttpException('Contractor not found', HttpStatus.NOT_FOUND);
      }

      // Update the balances and set the job as paid
      client.balance -= job.price;
      contractor.balance += job.price;

      // Save client, contractor, and job
      await client.save({ transaction });
      await contractor.save({ transaction });
      job.paid = true;
      job.paymentDate = new Date(); // now date
      await job.save({ transaction });

      await transaction.commit();

      return job;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
