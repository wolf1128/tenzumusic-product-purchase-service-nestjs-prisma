import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Query,
	Res,
} from '@nestjs/common';
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

	// @desc        Get product info
	// @route       GET /products/:id
	// @access      Public
	@Get('/:id')
	async getProduct(@Param('id') id: string) {
		const product = await this.service.findOneProduct(id);

		return product;
	}

	// @desc        Get all products info
	// @route       GET /products?minPrice=xx&maxPrice=xx
	// @access      Public
	@Get()
	async getProducts(
		@Query('minPrice') minPrice: string,
		@Query('maxPrice') maxPrice: string
	) {
		return await this.service.findAllProductsAndFilter(
			parseInt(minPrice),
			parseInt(maxPrice)
		);
	}
}
