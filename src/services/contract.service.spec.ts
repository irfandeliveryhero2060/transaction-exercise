import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { ContractsService } from './contract.service';
import { Contract, ContractStatus } from '../model/contract.model';
import { Profile } from '../model/profile.model';

describe('ContractsService', () => {
  let contractsService: ContractsService;
  let contractModel: typeof Contract;

  // Mock data
  const mockContract = {
    id: 1,
    status: 'in_progress',
    ClientId: 1,
    ContractorId: 2,
  };

  const mockProfile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    profession: 'Developer',
  };

  // Set up the testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: getModelToken(Contract),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockContract),
            findAll: jest.fn().mockResolvedValue([mockContract]),
          },
        },
        {
          provide: getModelToken(Profile),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockProfile),
          },
        },
      ],
    }).compile();

    contractsService = module.get<ContractsService>(ContractsService);
    contractModel = module.get<typeof Contract>(getModelToken(Contract));
  });

  it('should be defined', () => {
    expect(contractsService).toBeDefined();
  });

  it('should return a contract by ID', async () => {
    const contract = await contractsService.getContractById(1);
    expect(contract).toEqual(mockContract);
    expect(contractModel.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw an error if contract is not found', async () => {
    jest.spyOn(contractModel, 'findOne').mockResolvedValueOnce(null); // Mock not found contract
    await expect(contractsService.getContractById(1)).rejects.toThrowError(
      'Contract not found or does not belong to user',
    );
  });

  it('should return all user contracts excluding terminated contracts', async () => {
    const userContracts = await contractsService.getUserContracts(1);
    expect(userContracts).toEqual([mockContract]);
    expect(contractModel.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [{ ClientId: 1 }, { ContractorId: 1 }],
        status: { [Op.ne]: ContractStatus.TERMINATED },
      },
    });
  });
});
