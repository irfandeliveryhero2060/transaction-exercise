import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';

import { AdminService } from './admin.service';
import { Job } from '../model/job.model';

describe('AdminService', () => {
  let adminService: AdminService;
  let jobModel: typeof Job;

  const mockJobModel = {
    sequelize: {
      query: jest.fn(),
    },
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
    const mockResult = [
      {
        profession: 'Plumber',
        total_earnings: 500,
      },
    ];

    jest
      .spyOn(jobModel.sequelize, 'query')
      //@ts-ignore
      .mockResolvedValueOnce(mockResult);

    const result = await adminService.getBestProfession(
      '2024-12-01',
      '2024-12-31',
    );

    expect(result).toEqual(mockResult[0]); // Should return the best profession with earnings
    expect(jobModel.sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.objectContaining({
        replacements: { start: '2024-12-01', end: '2024-12-31' },
        type: expect.any(String),
      }),
    );
  });

  it('should return the best clients', async () => {
    const mockClientResult = [
      {
        clientId: 1,
        totalPayment: 1500,
      },
    ];

    jest
      .spyOn(jobModel.sequelize, 'query')
      //@ts-ignore
      .mockResolvedValueOnce(mockClientResult);

    const result = await adminService.getBestClients(
      '2024-12-01',
      '2024-12-31',
      1,
    );

    expect(result).toEqual(mockClientResult); // Should return the best client with total payment
    expect(jobModel.sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.objectContaining({
        replacements: { start: '2024-12-01', end: '2024-12-31', limit: 1 },
        type: expect.any(String),
      }),
    );
  });

  it('should handle empty job results for best clients', async () => {
    jest
      .spyOn(jobModel.sequelize, 'query')
      //@ts-ignore
      .mockResolvedValueOnce([]);

    const result = await adminService.getBestClients(
      '2024-12-01',
      '2024-12-31',
      1,
    );

    expect(result).toEqual([]); // Should return empty array if no clients found
  });

  it('should return the best clients with limit', async () => {
    const mockClientResult = [
      {
        clientId: 2,
        totalPayment: 1000,
      },
    ];

    jest
      .spyOn(jobModel.sequelize, 'query')
      //@ts-ignore
      .mockResolvedValueOnce(mockClientResult);

    const result = await adminService.getBestClients(
      '2024-12-01',
      '2024-12-31',
      1,
    );

    expect(result).toEqual(mockClientResult); // Should return the client with the highest payment
  });
});
