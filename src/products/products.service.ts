import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { CreateProductDto } from './dto/create-product.dto';
import { Product as ProductModel, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
	constructor(private readonly service: PrismaService) {}

	// Data Layer methods

	addProduct = async (
		id: string,
		name: string,
		stock: number,
		price: number
	) => {
		return await this.service.product.create({
			data: {
				id,
				name,
				stock,
				price,
			},
		});
	};

	findOneProduct = async (id: string) => {
		return await this.service.product.findFirst({
			where: { id },
		});
	};

	findAllProductsAndFilter = async (minPrice: number, maxPrice: number) => { // NOTE: Without any of the query strings, we'll get NaN after parsing to int. After all remember NaN is a falsy value.
		if (minPrice && maxPrice) { // NOTE: If you provide minPrice grather than the minPrice you'll get nothing of course!
			// Way#1
			// const sql = `SELECT * FROM PRODUCTS WHERE Price BETWEEN $minPrice AND $maxPrice`;
			// return await this.service.$queryRaw`${sql}`;
			// Way#2
			return await this.service.product.findMany({
				where: {
					AND: [
						{
							price: {
								gte: minPrice,
							},
						},
						{
							price: {
								lte: maxPrice,
							},
						},
					],
				},
			});
		} else if (minPrice) {
			return await this.service.product.findMany({
				where: {
					price: {
						gte: minPrice,
					},
				},
			});
		} else if (maxPrice) {
			return await this.service.product.findMany({
				where: {
					price: {
						lte: maxPrice,
					},
				},
			});
		} else {
			return await this.service.product.findMany();
		}
	};

	// Validations

	validateCreateProduct(product: CreateProductDto) {
		const schema = Joi.object({
			name: Joi.string().required(),
			stock: Joi.number().min(0).required(),
			price: Joi.number().min(0).required(),
		});

		return schema.validate(product);
	}
}
