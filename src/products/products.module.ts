import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ProductsService, PrismaService],
  controllers: [ProductsController]
})
export class ProductsModule {}
