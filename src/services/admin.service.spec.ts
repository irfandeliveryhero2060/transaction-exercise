import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';
import { getModelToken } from '@nestjs/sequelize';

import { AdminService } from './admin.service';
import { Job } from '../model/job.model';
import { Contract } from '../model/contract.model';
import { Profile } from '../model/profile.model';

describe('AdminService', () => {
  let adminService: AdminService;
  let jobModel: typeof Job;

  // Mock Data
  const mockProfileClient = { id: 1, profession: 'Engineer' };
  const mockProfileContractor = { id: 2, profession: 'Plumber' };
  const mockContract = {
    client: mockProfileClient,
    contractor: mockProfileContractor,
  };

  const mockJobs = [
    {
      price: 200,
      paymentDate: '2024-12-01',
      contract: mockContract,
    },
    {
      price: 300,
      paymentDate: '2024-12-05',
      contract: mockContract,
    },
  ];

  const mockJobModel = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(Job),
          useValue: mockJobModel,
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
    jobModel = module.get<typeof Job>(getModelToken(Job));
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });

  it('should return the best profession', async () => {
    jest.spyOn(jobModel, 'findAll').mockResolvedValueOnce(mockJobs as any);

    const result = await adminService.getBestProfession(
      '2024-12-01',
      '2024-12-31',
    );

    expect(result).toEqual(['Plumber', 500]); // Sorted by earnings, the profession with the most earnings first
    expect(jobModel.findAll).toHaveBeenCalledWith({
      where: {
        paymentDate: {
          [Op.gte]: new Date('2024-12-01'),
          [Op.lte]: new Date('2024-12-31'),
        },
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'client',
            },
            {
              model: Profile,
              as: 'contractor',
            },
          ],
        },
      ],
    });
  });

  it('should return the best clients', async () => {
    const mockClientJobs = [
      {
        price: 500,
        paymentDate: '2024-12-01',
        contract: { client: { id: 1 }, price: 500 },
      },
      {
        price: 1000,
        paymentDate: '2024-12-05',
        contract: { client: { id: 1 }, price: 1000 },
      },
    ];

    jest
      .spyOn(jobModel, 'findAll')
      .mockResolvedValueOnce(mockClientJobs as any);

    const result = await adminService.getBestClients(
      '2024-12-01',
      '2024-12-31',
      1,
    );

    expect(result).toEqual([{ clientId: '1', totalPayment: 1500 }]);
    expect(jobModel.findAll).toHaveBeenCalledWith({
      where: {
        paymentDate: {
          [Op.gte]: new Date('2024-12-01'),
          [Op.lte]: new Date('2024-12-31'),
        },
        paid: true,
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'client',
            },
          ],
        },
      ],
    });
  });

  it('should handle empty job results for best clients', async () => {
    jest.spyOn(jobModel, 'findAll').mockResolvedValueOnce([]); // No jobs

    const result = await adminService.getBestClients(
      '2024-12-01',
      '2024-12-31',
      1,
    );

    expect(result).toEqual([]);
    expect(jobModel.findAll).toHaveBeenCalledWith({
      where: {
        paymentDate: {
          [Op.gte]: new Date('2024-12-01'),
          [Op.lte]: new Date('2024-12-31'),
        },
        paid: true,
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'client',
            },
          ],
        },
      ],
    });
  });

  it('should return the best clients with limit', async () => {
    const mockClientJobs = [
      {
        price: 500,
        paymentDate: '2024-12-01',
        contract: { client: { id: 1 }, price: 500 },
      },
      {
        price: 1000,
        paymentDate: '2024-12-05',
        contract: { client: { id: 2 }, price: 1000 },
      },
    ];

    jest
      .spyOn(jobModel, 'findAll')
      .mockResolvedValueOnce(mockClientJobs as any);

    const result = await adminService.getBestClients(
      '2024-12-01',
      '2024-12-31',
      1,
    );

    expect(result).toEqual([{ clientId: '2', totalPayment: 1000 }]); // client 2 has the highest total
  });
});
