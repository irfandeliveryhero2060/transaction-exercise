import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Op } from 'sequelize';

import { Contract } from 'src/model/contract.model';

@Injectable()
export class ContractOwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const contractId = request.params.id; // Assuming contract ID is in the URL parameter
    const userProfile = request.profile;

    if (!userProfile) {
      throw new ForbiddenException('You must be authenticated');
    }

    // Check if the user is the client or contractor for the specified contract
    const contract = await Contract.findOne({
      where: {
        id: contractId,
        [Op.or]: [
          { ClientId: userProfile.id },
          { ContractorId: userProfile.id },
        ],
      },
    });

    if (!contract) {
      throw new ForbiddenException(
        'You are not authorized to access this contract',
      );
    }

    return true;
  }
}
