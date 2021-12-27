import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Response } from 'express';
import { ProductsService } from './products.service';
import * as uniqid from 'uniqid';

@Controller('products')
export class ProductsController {
	constructor(private readonly service: ProductsService) {}

	// @desc        Create a new product
	// @route       POST /products
	// @access      Public
	@Post()
	// @HttpCode(201)
	async createProduct(
		@Body() createProductDto: CreateProductDto,
		@Res() res: Response
	) {
		const { error } = this.service.validateCreateProduct(createProductDto);
		if (error)
			return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

		const { name, stock, price } = createProductDto;
		const id = uniqid();

		await this.service.addProduct(id, name, stock, price);

		const message = 'The Product has been created successfully.';

        
		return res.status(HttpStatus.CREATED).send(message); // it will automatically be serialized to JSON.
	}
}
