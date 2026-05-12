import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './rooms.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [RoomsController],
  providers: [RoomsRepository, RoomsService],
  exports: [RoomsRepository, RoomsService],
})
export class RoomsModule {}
