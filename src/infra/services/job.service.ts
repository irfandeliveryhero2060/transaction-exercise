import { Injectable } from '@nestjs/common';
import { Job } from '../model/job.model';
import { Profile } from '../model/profile.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job) private jobModel: typeof Job,
    @InjectModel(Profile) private profileModel: typeof Profile,
  ) {}

  async getUnpaidJobs(userId: number): Promise<Job[]> {
    return this.jobModel.findAll({
      where: { paid: false, Contract: { ClientId: userId } },
    });
  }

  async payForJob(jobId: number, amount: number, userId: number): Promise<Job> {
    const job = await this.jobModel.findByPk(jobId);
    if (!job || job.ContractId !== userId) {
      throw new Error('Job not found or does not belong to the user');
    }

    const client = await this.profileModel.findByPk(userId);
    if (client.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const contractor = await this.profileModel.findByPk(job.ContractId);
    client.balance -= amount;
    contractor.balance += amount;

    await client.save();
    await contractor.save();

    job.paid = true;
    await job.save();

    return job;
  }
}
