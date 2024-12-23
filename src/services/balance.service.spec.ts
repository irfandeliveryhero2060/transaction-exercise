import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balance.service';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Profile } from '../model/profile.model';
import { Contract } from '../model/contract.model';
import { Job } from '../model/job.model';
import { Op } from 'sequelize';

describe('BalancesService', () => {
  let balancesService: BalancesService;
  let profileModel: typeof Profile;
  let sequelize: Sequelize;

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
        BalancesService,
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

    balancesService = module.get<BalancesService>(BalancesService);
    profileModel = module.get<typeof Profile>(getModelToken(Profile));
    sequelize = module.get<Sequelize>(Sequelize);
  });

  it('should be defined', () => {
    expect(balancesService).toBeDefined();
  });

  describe('depositBalance', () => {
    it('should successfully deposit balance for a user', async () => {
      const mockContracts = [
        {
          id: 1,
          jobs: [{ id: 1, price: 100, paid: false }],
        },
      ];
      const mockClient = { id: 1, balance: 50, save: jest.fn() };

      jest
        .spyOn(Contract, 'findAll')
        .mockResolvedValueOnce(mockContracts as any);
      jest
        .spyOn(profileModel, 'findByPk')
        .mockResolvedValueOnce(mockClient as any);
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);

      const result = await balancesService.depositBalance(1, 25);

      expect(result).toEqual(mockClient);
      expect(Contract.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }],
        },
        include: {
          model: Job,
          required: true,
          where: { paid: false },
        },
        transaction: mockTransaction,
      });
      expect(profileModel.findByPk).toHaveBeenCalledWith(1, {
        transaction: mockTransaction,
      });
      expect(mockClient.balance).toBe(75); // Balance updated
      expect(mockClient.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw an error if no contracts are found', async () => {
      jest.spyOn(Contract, 'findAll').mockResolvedValueOnce([]);
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);

      await expect(balancesService.depositBalance(1, 25)).rejects.toThrow(
        'No contracts found for this user',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if the deposit exceeds 25% of unpaid jobs total', async () => {
      const mockContracts = [
        {
          id: 1,
          jobs: [{ id: 1, price: 100, paid: false }],
        },
      ];

      jest
        .spyOn(Contract, 'findAll')
        .mockResolvedValueOnce(mockContracts as any);
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);

      await expect(balancesService.depositBalance(1, 30)).rejects.toThrow(
        'Deposit cannot exceed 25% of the unpaid jobs total.',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if the client is not found', async () => {
      const mockContracts = [
        {
          id: 1,
          jobs: [{ id: 1, price: 100, paid: false }],
        },
      ];

      jest
        .spyOn(Contract, 'findAll')
        .mockResolvedValueOnce(mockContracts as any);
      jest.spyOn(profileModel, 'findByPk').mockResolvedValueOnce(null);
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction as any);

      await expect(balancesService.depositBalance(1, 25)).rejects.toThrow(
        'Client not found',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
