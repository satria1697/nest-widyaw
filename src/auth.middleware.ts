import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Connection } from 'typeorm';
import { Auth } from './auth/entities/auth.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private connection: Connection) {}
  async use(req: any, res: Response, next: NextFunction) {
    const secret = req.get('x-header');
    if (secret) {
      const found = await this.connection
        .getRepository(Auth)
        .createQueryBuilder()
        .where('jwt = :jwt', { jwt: secret })
        .getOne();

      if (found) {
        next();
      }
    }
  }
}
