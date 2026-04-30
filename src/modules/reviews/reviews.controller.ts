import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsQueryDto } from './dto/get-reviews.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('tenant')
  @ApiOperation({ summary: 'Create a review for a completed booking (Tenant)' })
  create(
    @GetCurrentUser('sub') tenantId: string,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewsService.create(tenantId, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with pagination & filtering' })
  findAll(@Query() query: GetReviewsQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review details' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a review (Admin)' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}

