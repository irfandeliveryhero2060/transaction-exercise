import { Injectable } from '@nestjs/common';
import { Profile } from '../model/profile.model';
import { Job } from '../model/job.model';
import { Contract } from '../model/contract.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class BalancesService {
  constructor(@InjectModel(Profile) private profileModel: typeof Profile) {}

  async depositBalance(userId: number, amount: number): Promise<Profile> {
    // Query Contracts directly
    const contracts = await Contract.findAll({
      where: {
        // You can adjust this based on whether you are looking for the client or contractor
        [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
      },
      include: {
        model: Job,
        required: true,
        where: { paid: false }, // Filter for unpaid jobs
      },
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

    // Retrieve the client profile if needed (optional)
    const client = await this.profileModel.findByPk(userId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Update the balance
    client.balance += amount;
    await client.save();

    return client;
  }
}
