import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';

import { Job } from '../model/job.model';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Job) private jobModel: typeof Job) {}

  async getBestProfession(start: string, end: string): Promise<any> {
    const result = await this.jobModel.sequelize.query(
      `
    SELECT 
        p.profession,
        SUM(j.price) AS total_earnings
    FROM 
        "Jobs" j
    JOIN 
        "Contracts" c ON j."ContractId" = c.id
    JOIN 
        "Profiles" p ON c."ContractorId" = p.id
    WHERE 
        j."paymentDate" >= :start
        AND j."paymentDate" <= :end
        AND p.type = 'contractor'
    GROUP BY 
        p.profession
    ORDER BY 
        total_earnings DESC
    LIMIT 1;
    `,
      {
        replacements: { start, end },
        type: QueryTypes.SELECT,
      },
    );

    // Return the first (and only) result from the query
    if (result.length > 0) {
      return result[0];
    }
    throw new HttpException('NOt found', HttpStatus.NOT_FOUND);
  }

  async getBestClients(
    start: string,
    end: string,
    limit: number,
  ): Promise<any> {
    const result = await this.jobModel.sequelize.query(
      `
    SELECT 
      p.id AS clientId, 
      SUM(j.price) AS totalPayment
    FROM 
      "Jobs" j
    JOIN 
      "Contracts" c ON j."ContractId" = c.id
    JOIN 
      "Profiles" p ON c."ClientId" = p.id
    WHERE 
      j."paymentDate" >= :start
      AND j."paymentDate" <= :end
      AND j.paid = true
      AND p.type = 'client'
    GROUP BY 
      p.id
    ORDER BY 
      totalPayment DESC
    LIMIT :limit;
    `,
      {
        replacements: { start, end, limit },
        type: QueryTypes.SELECT,
      },
    );

    return result;
  }
}
