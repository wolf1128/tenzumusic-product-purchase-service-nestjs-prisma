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
