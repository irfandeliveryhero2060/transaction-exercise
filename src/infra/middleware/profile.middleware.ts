import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile } from './../model/profile.model'; // Your profile model
import { Request, Response, NextFunction } from 'express';

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
