import { Request, Response, NextFunction } from 'express';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { Profile } from 'src/model/profile.model';

@Injectable()
export class GetProfileMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const profileId = req.headers['profile_id'];

    if (!profileId) {
      throw new UnauthorizedException('Profile ID is missing');
    }

    const profile = await Profile.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new UnauthorizedException('Profile not found');
    }

    // Attach the profile to the request
    req.profile = profile;

    next();
  }
}
