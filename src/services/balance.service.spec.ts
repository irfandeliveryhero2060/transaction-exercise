import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balance.service';
import { Profile } from '../model/profile.model';
import { Contract } from '../model/contract.model';
import { Job } from '../model/job.model';
import { Sequelize } from 'sequelize-typescript';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';

describe('BalancesService', () => {
  let balancesService: BalancesService;
  let profileModel: typeof Profile;
  let contractModel: typeof Contract;
  let sequelize: Sequelize;

  // Mock data
  const mockProfile = { id: 1, balance: 1000 };
  const mockContract = {
    id: 1,
    ClientId: 1,
    ContractorId: 2,
    jobs: [{ price: 200, paid: false }],
  };

  // Mock transaction and methods
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: getModelToken(Profile),
          useValue: {
            findByPk: jest.fn().mockResolvedValue(mockProfile),
          },
        },
        {
          provide: getModelToken(Contract),
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockContract]),
          },
        },
        {
          provide: Sequelize,
          useValue: {
            transaction: jest.fn().mockResolvedValue(mockTransaction),
            addModels: jest.fn(),
          },
        },
      ],
    }).compile();

    balancesService = module.get<BalancesService>(BalancesService);
    profileModel = module.get<typeof Profile>(getModelToken(Profile));
    contractModel = module.get<typeof Contract>(getModelToken(Contract));
    sequelize = module.get<Sequelize>(Sequelize);

    // Initialize models with Sequelize instance (important for Sequelize ORM)
    sequelize.addModels([Profile, Contract, Job]); // Ensure models are added
  });

  it('should be defined', () => {
    expect(balancesService).toBeDefined();
  });

  it('should deposit balance and update client profile', async () => {
    const updatedProfile = await balancesService.depositBalance(1, 50);

    expect(updatedProfile).toEqual(mockProfile);
    expect(profileModel.findByPk).toHaveBeenCalledWith(1, {
      transaction: mockTransaction,
    });
    expect(contractModel.findAll).toHaveBeenCalledWith({
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
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw error if no contracts found', async () => {
    jest.spyOn(contractModel, 'findAll').mockResolvedValueOnce([]); // Mock no contracts found

    await expect(balancesService.depositBalance(1, 50)).rejects.toThrowError(
      'No contracts found for this user',
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error if deposit exceeds max allowed amount', async () => {
    const contractWithJobs = {
      ...mockContract,
      jobs: [{ price: 1000, paid: false }],
    };

    // @ts-ignore
    jest
      .spyOn(contractModel, 'findAll')
      .mockResolvedValueOnce([contractWithJobs]); // Mock a contract with large unpaid jobs
    await expect(balancesService.depositBalance(1, 300)).rejects.toThrowError(
      'Deposit cannot exceed 25% of the unpaid jobs total.',
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw error if client not found', async () => {
    jest.spyOn(profileModel, 'findByPk').mockResolvedValueOnce(null); // Mock client not found

    await expect(balancesService.depositBalance(1, 50)).rejects.toThrowError(
      'Client not found',
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });
});
