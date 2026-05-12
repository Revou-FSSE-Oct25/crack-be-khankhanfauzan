import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { GetUsersQueryDto } from './dto/get-users.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiOkResponse({
    description: 'Daftar pengguna (users/tenants)',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Users fetched' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        meta: {
          type: 'object',
          properties: {
            totalItems: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            perPage: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  getAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserAdminDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.usersService.updateAdmin(id, dto);
  }

  @Patch(':id/profile')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user profile with file uploads' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotoProfile', maxCount: 1 },
      { name: 'fotoKtp', maxCount: 1 },
      { name: 'fotoBukuNikah', maxCount: 1 }
    ], {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException(`Only image files are allowed for ${file.fieldname}!`), false);
        }
        cb(null, true);
      },
    })
  )
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFiles() files: {
      fotoProfile?: Express.Multer.File[];
      fotoKtp?: Express.Multer.File[];
      fotoBukuNikah?: Express.Multer.File[];
    },
    @GetCurrentUser('role') role: string,
    @GetCurrentUser('sub') userId: string,
  ) {
    if (role !== 'admin' && userId !== id) {
      return { status: 403, message: 'Forbidden', data: null };
    }
    return this.usersService.updateProfile(id, dto, files);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
