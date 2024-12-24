import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

import { JobsService } from './job.service';
import { Job } from '../model/job.model';
import { Profile } from '../model/profile.model';
import { Contract, ContractStatus } from '../model/contract.model';

describe('JobsService', () => {
  let jobsService: JobsService;
  let jobModel: typeof Job;
  let profileModel: typeof Profile;
  let sequelize: Sequelize;

  const mockJobModel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProfileModel = {
    findByPk: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
      LOCK: {
        UPDATE: 'UPDATE', // Mock the LOCK.UPDATE property
      },
    })),
  };

  const mockTransaction = mockSequelize.transaction();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getModelToken(Job),
          useValue: mockJobModel,
        },
        {
          provide: getModelToken(Profile),
          useValue: mockProfileModel,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    jobsService = module.get<JobsService>(JobsService);
    jobModel = module.get<typeof Job>(getModelToken(Job));
    profileModel = module.get<typeof Profile>(getModelToken(Profile));
    sequelize = module.get<Sequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(jobsService).toBeDefined();
  });

  describe('getUnpaidJobs', () => {
    it('should return unpaid jobs for a given user', async () => {
      const mockJobs = [
        {
          id: 1,
          paid: false,
          Contract: { ClientId: 1, status: 'active' },
        },
      ];

      jest.spyOn(jobModel, 'findAll').mockResolvedValueOnce(mockJobs as any);

      const result = await jobsService.getUnpaidJobs(1);

      expect(result).toEqual(mockJobs);
      expect(jobModel.findAll).toHaveBeenCalledWith({
        where: { paid: false },
        include: [
          {
            model: Contract,
            where: {
              status: { [Op.ne]: ContractStatus.TERMINATED },
              [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }],
            },
          },
        ],
      });
    });
  });

  describe('payForJob', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should successfully pay for a job', async () => {
      const mockJob = {
        id: 1,
        paid: false,
        price: 50,
        contract: { ContractorId: 2 },
        save: jest.fn(),
      };
      const mockClient = { id: 1, balance: 100, save: jest.fn() };
      const mockContractor = { id: 2, balance: 50, save: jest.fn() };

      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest.spyOn(jobModel, 'findOne').mockResolvedValueOnce(mockJob as any);
      jest
        .spyOn(profileModel, 'findByPk')
        .mockResolvedValueOnce(mockClient as any) // First call: Client
        .mockResolvedValueOnce(mockContractor as any); // Second call: Contractor

      jest
        .spyOn(jobModel, 'findOne')
        .mockImplementationOnce(() => mockJob as any);

      const result = await jobsService.payForJob(1, 1);

      expect(result).toEqual(mockJob);
      expect(jobModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, paid: false },
          include: [
            {
              model: Contract,
              where: {
                ClientId: 1,
                status: { [Op.ne]: ContractStatus.TERMINATED },
              },
            },
          ],
          lock: 'UPDATE', // Directly include lock at top level
        }),
      );

      expect(profileModel.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(profileModel.findByPk).toHaveBeenCalledWith(2, expect.any(Object));
      expect(mockClient.balance).toBe(50); // Client balance updated
      expect(mockContractor.balance).toBe(100); // Contractor balance updated
      expect(mockClient.save).toHaveBeenCalled();
      expect(mockContractor.save).toHaveBeenCalled();
      expect(result.paid).toBe(true); // Job marked as paid
      expect(result.save).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled(); // Transaction committed
    });

    it('should throw an error if the job is not found', async () => {
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest.spyOn(jobModel, 'findOne').mockResolvedValueOnce(null);

      await expect(jobsService.payForJob(1, 1)).rejects.toThrow(
        'Job not found or already paid',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled(); // Transaction rolled back
    });

    it('should throw an error if the client has insufficient balance', async () => {
      const mockJob = {
        id: 1,
        paid: false,
        price: 100,
        contract: { ContractorId: 2 },
        save: jest.fn(),
      };
      const mockClient = { id: 1, balance: 50, save: jest.fn() };

      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest.spyOn(jobModel, 'findOne').mockResolvedValueOnce(mockJob as any);
      jest
        .spyOn(profileModel, 'findByPk')
        .mockResolvedValueOnce(mockClient as any);

      await expect(jobsService.payForJob(1, 1)).rejects.toThrow(
        'Insufficient balance',
      );

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if the contractor is not found', async () => {
      const mockJob = {
        id: 1,
        paid: false,
        price: 50,
        contract: { ContractorId: 2 },
        save: jest.fn(),
      };
      const mockClient = { id: 1, balance: 100, save: jest.fn() };

      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest.spyOn(jobModel, 'findOne').mockResolvedValueOnce(mockJob as any);
      jest
        .spyOn(profileModel, 'findByPk')
        .mockResolvedValueOnce(mockClient as any) // Client found
        .mockResolvedValueOnce(null); // Contractor not found

      await expect(jobsService.payForJob(1, 1)).rejects.toThrow(
        'Contractor not found',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
