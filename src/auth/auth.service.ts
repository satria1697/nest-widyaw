import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Connection } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { response } from '../utils/response';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  constructor(private connection: Connection, private jwtService: JwtService) {}

  private async getOneUser(id: number | string) {
    const query = this.connection.getRepository(Auth).createQueryBuilder();
    let res: Auth;
    if (typeof id === 'number') {
      res = await query.where('id = :id', { id }).getOne();
    } else {
      res = await query.where('email = :id', { id }).getOne();
    }
    return res;
  }

  private async setUser(user: Auth): Promise<boolean> {
    const query = await this.connection.createQueryRunner();
    await query.connect();
    await query.startTransaction();
    let res = false;
    try {
      await query.manager.save(user);

      await query.commitTransaction();
      res = true;
    } catch (e) {
      console.log(e);
      await query.rollbackTransaction();
    } finally {
      // you need to release a query which was manually instantiated
      await query.release();
    }
    return res;
  }

  async create(createAuthDto: CreateAuthDto) {
    const user = new Auth();
    user.name = createAuthDto.name;
    user.email = createAuthDto.email;
    user.gender = createAuthDto.gender;
    user.password = createAuthDto.password;

    const res = await this.setUser(user);
    if (res) {
      return response();
    }
    return response(undefined, 'fail', HttpStatus.FORBIDDEN);
  }

  async findAll() {
    const query = this.connection.getRepository(Auth).createQueryBuilder();
    const res = await query.getMany();
    return response(res);
  }

  async findOne(id: number) {
    const res = this.getOneUser(id);
    return response(res);
  }

  async login(loginCred: LoginDto) {
    const user = await this.getOneUser(loginCred.email);
    if (user) {
      const payload = {
        name: user.name,
        email: user.email,
        id: user.id,
      };
      const jwt = this.jwtService.sign(payload);

      const createAuthDto = new Auth();
      createAuthDto.id = user.id;
      createAuthDto.jwt = jwt;
      await this.setUser(createAuthDto);

      const res = {
        jwt,
      };
      return response(res);
    }
    return response(undefined, 'fail', HttpStatus.FORBIDDEN);
  }

  async logout(logoutCred: LogoutDto) {
    const jwt = logoutCred.jwt;

    const decoded = this.jwtService.decode(jwt);
    const user = await this.getOneUser(decoded['id']);
    if (user) {
      const createAuthDto = new Auth();
      createAuthDto.id = user.id;
      createAuthDto.jwt = null;
      const res = this.setUser(createAuthDto);
      if (res) {
        return response();
      }
    }
    return response(undefined, 'fail', HttpStatus.FORBIDDEN);
  }
}
