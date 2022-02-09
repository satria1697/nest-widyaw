import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Auth } from '../auth/entities/auth.entity';
import { Connection } from 'typeorm';
import { response } from '../utils/response';

@Injectable()
export class ProductService {
  constructor(private connection: Connection) {}

  private async getOne(id: number | string) {
    const query = this.connection
      .getRepository(ProductEntity)
      .createQueryBuilder();
    return await query.where('id = :id', { id }).getOne();
  }

  private async setProduct(data: ProductEntity): Promise<boolean> {
    const query = await this.connection.createQueryRunner();
    await query.connect();
    await query.startTransaction();
    let res = false;
    try {
      await query.manager.save(data);
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

  async create(createProductDto: CreateProductDto) {
    const product = new ProductEntity();
    product.price = createProductDto.price;
    product.title = createProductDto.title;
    product.description = createProductDto.description;

    const res = await this.setProduct(product);
    if (res) {
      return response();
    }
    return response(undefined, 'fail', HttpStatus.FORBIDDEN);
  }

  async findAll() {
    const query = this.connection
      .getRepository(ProductEntity)
      .createQueryBuilder();
    const res = await query.orderBy('id').getMany();
    return response(res);
  }

  async findOne(id: number) {
    const res = await this.getOne(id);
    if (res) {
      return response(res);
    }
    return response({});
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.getOne(id);
    if (product) {
      const productEntitiy = new ProductEntity();
      productEntitiy.id = id;
      productEntitiy.price = updateProductDto.price;
      productEntitiy.title = updateProductDto.title;
      productEntitiy.description = updateProductDto.description;
      const res = this.setProduct(productEntitiy);
      if (res) {
        return response();
      }
    }
    return response(undefined, 'fail', HttpStatus.FORBIDDEN);
  }

  async remove(id: number) {
    const product = await this.getOne(id);
    if (product) {
      const res = this.connection.getRepository(ProductEntity).remove(product);
      if (res) {
        return response();
      }
    }
    return response(undefined, 'fail', HttpStatus.FORBIDDEN);
  }
}
