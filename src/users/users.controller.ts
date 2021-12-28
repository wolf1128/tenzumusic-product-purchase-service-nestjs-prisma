import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { User as UserModel, Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import * as uniqid from 'uniqid';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';

@Controller('api/users')
export class UsersController {
	constructor(private readonly service: UsersService) {}

	// @desc        Register a new user
	// @route       POST /api/users
	// @access      Public
	@Post()
	// @HttpCode(201)
	async registerUser(
		@Body() createUserDto: CreateUserDto,
		@Res() res: Response
	) {
		const { error } = this.service.validateRegisterUser(createUserDto);
		if (error)
			return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

		const { first_name, last_name, email, password, age } = createUserDto;

		const hashedPassword = await this.service.hashPassword(password);
		const decimalAge = new Date().getFullYear() - new Date(age).getFullYear();
		const uniqueId = uniqid();

		await this.service.createUser(
			uniqueId,
			first_name,
			last_name,
			email,
			hashedPassword,
			decimalAge
		);

		return res
			.status(HttpStatus.CREATED)
			.send('The user has been created successfully.'); // it will automatically be serialized to JSON.
	}

	// @desc        Get user info
	// @route       POST /api/users/info
	// @access      Public
	@Post('info')
	// @HttpCode(201)
	async getUser(@Body() getUserDto: GetUserDto, @Res() res: Response) {
		const { error } = this.service.validateGetUser(getUserDto);
		if (error)
			return res.status(HttpStatus.BAD_REQUEST).send(error.details[0].message);

		const { id, password } = getUserDto;

		let user = await this.service.findOneUser(id);

		if (user && (await this.service.matchPassword(password, user.password))) {
			user.password = '****';
			res.json(user);
		} else {
			throw new HttpException(
				'Passwords are not match!',
				HttpStatus.UNAUTHORIZED
			);
		}
	}
}
