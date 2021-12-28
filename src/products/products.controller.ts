import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	Res,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Response } from 'express';
import { ProductsService } from './products.service';
import * as uniqid from 'uniqid';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { UsersService } from 'src/users/users.service';

@Controller('api/products')
export class ProductsController {
	constructor(
		private readonly productsService: ProductsService,
		private readonly usersService: UsersService
	) {}

	// @desc        Create a new product
	// @route       POST /api/products
	// @access      Public
	@Post()
	// @HttpCode(201)
	async createProduct(
		@Body() createProductDto: CreateProductDto,
		@Res() res: Response
	) {
		const { error } = this.productsService.validateCreateProduct(createProductDto);
		if (error)
			return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

		const { name, stock, price } = createProductDto;
		const id = uniqid();

		await this.productsService.addProduct(id, name, stock, price);

		const message = 'The Product has been created successfully.';

		return res.status(HttpStatus.CREATED).send(message); // it will automatically be serialized to JSON.
	}

	// @desc        Get product info
	// @route       GET /api/products/:id
	// @access      Public
	@Get('/:id')
	async getProduct(@Param('id') id: string) {
		const product = await this.productsService.findOneProduct(id);

		return product;
	}

	// @desc        Get all products info
	// @route       GET /api/products?minPrice=xx&maxPrice=xx
	// @access      Public
	@Get()
	async getProducts(
		@Query('minPrice') minPrice: string,
		@Query('maxPrice') maxPrice: string
	) {
		return await this.productsService.findAllProductsAndFilter(
			parseInt(minPrice),
			parseInt(maxPrice)
		);
	}

	// @desc        Purchase product
	// @route       PUT /api/products/purchase
	// @access      Public
	@Put('/purchase')
	async purchaseProduct(
		@Body() purchaseProductDto: PurchaseProductDto,
		@Res() res: Response
	) {
		const { error } = this.productsService.validatePurchaseProduct(purchaseProductDto);
		if (error)
			return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

		const { user: userId, product: productId, count } = purchaseProductDto;
		let totalPrice: number;

		// (1) Find the product
		const product = await this.productsService.findOneProduct(productId);
		if (product) {
			if (product.stock < count) {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
					message_fa: 'متاسفیم!تعداد درخواست بیشتر از موجودی است!',
					message_en: 'Sorry! Order count is greather than the stock!',
				});
			} else {
				// (2) Update product stock
				const newStock = product.stock - count;
				totalPrice = product.price * count;

				await this.productsService.updateProductStock(productId, newStock);

				// (3) Find the User
				const user = await this.usersService.findUserById(userId);
				if (user) {
					let userProducts = !user.purchased_products
						? null
						: user.purchased_products;

					// Convert string to array (SQLite constraint) | ['1234', '567', '89']
					let purchasedProducts = [];
					if (userProducts) {
						purchasedProducts = userProducts
							.split("'")
							.filter((p: string) => p !== '[' && p !== ']' && p !== ', ');

						purchasedProducts.push(product.id);
					} else {
						purchasedProducts = new Array(product.id);
					}

					// Convert back to string
					let updatedPurchasedProducts = purchasedProducts.toString();

					// (4) Update user Purchased Products
					await this.usersService.updateUserPurchasedProducts(
						userId,
						updatedPurchasedProducts
					);

					res.json({
						successMessage_fa: 'با تشکر از خرید شما!',
						successMessage_en: 'Thanks for purchasing from us!',
						totalPrice,
					});
				} else {
					throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
				}
			}
		} else {
			throw new HttpException('Product not found!', HttpStatus.NOT_FOUND);
		}
	}
}
