import { Injectable } from '@nestjs/common';
import { Job } from 'src/model/job.model';
import { Profile } from 'src/model/profile.model';
import { InjectModel } from '@nestjs/sequelize';
import { Contract } from 'src/model/contract.model';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

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
      include: [{
          model: Contract,
          where: { ClientId: userId, status: { [Op.ne]: 'terminated' } }, // Filtering the Contract model's ClientId field
      }],
    });
  }

  async payForJob(jobId: number, amount: number, userId: number): Promise<Job> {
    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Fetch the job and related contract within the transaction
      const job = await this.jobModel.findByPk(jobId, { transaction });
      if (!job) {
        throw new Error('Job not found or does not belong to the user');
      }

      // Fetch the client and contractor profiles within the transaction
      const client = await this.profileModel.findByPk(userId, { transaction });
      if (!client) {
        throw new Error('Client not found');
      }

      if (client.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get the contractor profile based on ContractId (using job.ContractId)
      const contractor = await this.profileModel.findByPk(job.ContractId, { transaction });
      if (!contractor) {
        throw new Error('Contractor not found');
      }

      // Update the balances and set the job as paid within the transaction
      client.balance -= amount;
      contractor.balance += amount;

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
