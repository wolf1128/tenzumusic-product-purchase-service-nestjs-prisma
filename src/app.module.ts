import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  providers: [PrismaService]
})
export class AppModule {}
