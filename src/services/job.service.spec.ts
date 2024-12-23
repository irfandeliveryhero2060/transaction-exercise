import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './job.service';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Job } from '../model/job.model';
import { Profile } from '../model/profile.model';
import { Contract } from '../model/contract.model';
import { Op } from 'sequelize';

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
            where: { ClientId: 1, status: { [Op.ne]: 'terminated' } },
          },
        ],
      });
    });
  });

  describe('payForJob', () => {
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

      const result = await jobsService.payForJob(1, 1);

      expect(result).toEqual(mockJob);
      expect(jobModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, paid: false },
        transaction: mockTransaction,
        include: [
          {
            model: Contract,
            where: { ClientId: 1, status: { [Op.ne]: 'terminated' } },
          },
        ],
      });
      expect(profileModel.findByPk).toHaveBeenCalledWith(1, {
        transaction: mockTransaction,
      });
      expect(profileModel.findByPk).toHaveBeenCalledWith(2, {
        transaction: mockTransaction,
      });
      expect(mockClient.balance).toBe(50); // Client balance updated
      expect(mockContractor.balance).toBe(100); // Contractor balance updated
      expect(mockClient.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockContractor.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockJob.paid).toBe(true); // Job marked as paid
      expect(mockJob.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled(); // Transaction committed
    });

    it('should throw an error if the job is not found', async () => {
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest.spyOn(jobModel, 'findOne').mockResolvedValueOnce(null);

      await expect(jobsService.payForJob(1, 1)).rejects.toThrow(
        'Job not found or does not belong to the user',
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
      expect(mockTransaction.rollback).toHaveBeenCalled(); // Transaction rolled back
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
      expect(mockTransaction.rollback).toHaveBeenCalled(); // Transaction rolled back
    });
  });
});
