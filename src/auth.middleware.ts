import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    const secret = req.get('x-header');
    console.log(secret);
    if (secret) {
      console.log('sini kok');
      next();
    }
  }
}
