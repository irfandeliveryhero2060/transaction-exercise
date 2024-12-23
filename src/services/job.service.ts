import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Job } from '../model/job.model';
import { Profile } from '..//model/profile.model';

import { Contract } from '../model/contract.model';

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
          where: { ClientId: userId, status: { [Op.ne]: 'terminated' } }, // Filtering the Contract model's ClientId field
        },
      ],
    });
  }

  async payForJob(jobId: number, userId: number): Promise<Job> {
    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Fetch the job and related contract within the transaction
      const job = await this.jobModel.findOne({
        where: {
          id: jobId, // Use the primary key field name here
          paid: false, // Add the paid condition here
        },
        transaction,
        include: [
          {
            model: Contract,
            where: {
              ClientId: userId,
              status: { [Op.ne]: 'terminated' }, // Filtering the Contract model's ClientId field
            },
          },
        ],
        lock: transaction.LOCK.UPDATE, // Locking the job and contract rows
      });

      if (!job) {
        throw new HttpException(
          'Job not found or does not belong to the user',
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch the client profile within the transaction and lock the row
      const client = await this.profileModel.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE, // Locking the client row
      });
      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }

      if (client.balance < job.price) {
        throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
      }

      // Fetch the contractor profile based on ContractId and lock the row
      const contractor = await this.profileModel.findByPk(
        job.contract.ContractorId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE, // Locking the contractor row
        },
      );

      if (!contractor) {
        throw new Error('Contractor not found');
      }

      // Update the balances and set the job as paid within the transaction
      client.balance -= job.price;
      contractor.balance += job.price;

      // Save client, contractor, and job within the transaction
      await client.save({ transaction });
      await contractor.save({ transaction });

      job.paid = true;
      await job.save({ transaction });

      // Commit the transaction if everything is successful
      await transaction.commit();

      return job;
    } catch (error) {
      // If anything goes wrong, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  }
}
