// src/custom.d.ts

import { Profile } from './profile.model'; // Adjust path to your Profile model
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      profile?: Profile;
    }
  }
}
