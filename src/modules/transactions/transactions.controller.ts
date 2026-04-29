import { Controller, Post, Body, Patch, Param, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TransactionsService } from './transactions.service';
import { UploadPaymentProofDto } from './dto/upload-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post('upload-proof')
  @Roles('tenant')
  @ApiOperation({ summary: 'Upload payment proof for an invoice (Tenant)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoiceId: { type: 'string' },
        amount: { type: 'number' },
        paymentMethod: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Payment proof image (jpg, png, jpeg)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadPaymentProof(
    @Body() dto: UploadPaymentProofDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.transactionsService.uploadPaymentProof(dto, file);
  }

  @Patch(':id/verify')
  @Roles('admin')
  @ApiOperation({ summary: 'Verify or reject a payment (Admin)' })
  @ApiOkResponse({
    description: 'Payment verification result',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Payment verified successfully' },
        data: { type: 'object' },
      },
    },
  })
  verifyPayment(
    @Param('id') id: string,
    @GetCurrentUser('sub') adminId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.transactionsService.verifyPayment(id, adminId, dto);
  }
}
