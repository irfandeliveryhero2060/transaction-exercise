import { Injectable } from '@nestjs/common';
import { Profile } from '../model/profile.model';
import { Job } from '../model/job.model';
import { InjectModel } from '@nestjs/sequelize'; // Ensure correct import path

@Injectable()
export class BalancesService {
  constructor(@InjectModel(Profile) private profileModel: typeof Profile) {}

  async depositBalance(userId: number, amount: number): Promise<Profile> {
    const client = await this.profileModel.findByPk(userId, {
      include: [Job], // Ensure the Job model is included in the query
    });
    if (!client) {
      throw new Error('Client not found');
    }

    // `client.clientJobs` is now typed as `Job[]`
    // const unpaidJobs = await client.clientJobs.findAll({
    //   where: { paid: false },
    // });
    //TODO:update it
    const unpaidJobs =[]
    const totalToPay = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
    const maxDepositAmount = totalToPay * 0.25;

    if (amount > maxDepositAmount) {
      throw new Error(`Deposit cannot exceed 25% of the unpaid jobs total.`);
    }

    client.balance += amount;
    await client.save();

    return client;
  }
}
