import { Injectable } from '@nestjs/common';
import { Job } from 'src/model/job.model';
import { Profile } from 'src/model/profile.model';
import { Op } from 'sequelize';
import { Contract } from 'src/model/contract.model';

@Injectable()
export class AdminService {

  async getBestProfession(start: string, end: string): Promise<any> {
    const jobs = await Job.findAll({
      where: {
        paymentDate: { [Op.gte]: new Date(start), [Op.lte]: new Date(end) },
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'client',  // Alias for the Client relationship
            },
            {
              model: Profile,
              as: 'contractor',  // Alias for the Contractor relationship
            },
          ],
        },
      ],
    });

    const professionEarnings = jobs.reduce((acc, job) => {
      const profession = job.contract.contractor.profession;  // Access the contractor's profession
      if (!acc[profession]) {
        acc[profession] = 0;
      }
      acc[profession] += job.price;
      return acc;
    }, {});

    return Object.entries(professionEarnings)
      .sort(([, a], [, b]) => Number(b) - Number(a))  // Explicitly cast a and b to numbers
      [0];
  }

  async getBestClients(
    start: string,
    end: string,
    limit: number,
  ): Promise<any> {
    const jobs = await Job.findAll({
      where: {
        paymentDate: { [Op.gte]: new Date(start), [Op.lte]: new Date(end) },
        paid: true,
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'client',  // Alias for the Client relationship
            },
          ],
        },
      ],
    });

    const clientPayments = jobs.reduce((acc, job) => {
      const clientId = job.contract.client.id;  // Access clientId from the contract's client Profile
      if (!acc[clientId]) {
        acc[clientId] = 0;
      }
      acc[clientId] += job.price;
      return acc;
    }, {});

    const sortedClients = Object.entries(clientPayments)
      .sort(([, a], [, b]) => {
        // Ensure a and b are treated as numbers
        return Number(b) - Number(a);
      })
      .slice(0, limit);

    return sortedClients.map(([clientId, totalPayment]) => ({
      clientId,
      totalPayment,
    }));
  }
}