import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsRepository } from './reviews.repository';
import { BookingsRepository } from '../bookings/bookings.repository';
import { GetReviewsQueryDto } from './dto/get-reviews.dto';
import { ApiListResponse } from 'src/types/api-response.interface';
import { Review, Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repository: ReviewsRepository,
    private readonly bookingsRepository: BookingsRepository
  ) { }

  async create(tenantId: string, dto: CreateReviewDto) {
    // 1. Validate Booking
    const booking = await this.bookingsRepository.findById(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    // 2. Validate Tenant
    if (booking.tenantId !== tenantId) {
      throw new BadRequestException('You can only review your own bookings');
    }

    // 3. Validate Status
    if (booking.status !== 'completed') {
      throw new BadRequestException('You can only review completed stays');
    }

    // 4. Check if review already exists
    const existingReview = await this.repository.findAll({
      where: { bookingId: dto.bookingId }
    });

    if (existingReview.length > 0) {
      throw new BadRequestException('Review already exists for this booking');
    }

    // 5. Create Review
    const data = await this.repository.create({
      rating: dto.rating,
      comment: dto.comment,
      booking: { connect: { id: dto.bookingId } }
    });

    return { status: 201, message: 'Review created successfully', data };
  }

  async findAll(
    currentUserId: string,
    currentUserRole: string,
    query: GetReviewsQueryDto
  ): Promise<ApiListResponse<Review, { totalItems: number; page: number; perPage: number; totalPages: number; }>> {
    const { page = 1, perPage = 10, roomId, tenantId } = query || {};
    const where: Prisma.ReviewWhereInput = {};

    // Base condition for booking relation
    where.booking = {};

    // Role-based access control
    if (currentUserRole === 'tenant') {
      // Tenants can ONLY see their own reviews
      where.booking.tenantId = currentUserId;
    } else {
      // Admins can filter by specific tenantId if provided
      if (tenantId) where.booking.tenantId = tenantId;
    }

    if (roomId) where.booking.roomId = roomId;

    // Cleanup empty booking object if no conditions were added
    if (Object.keys(where.booking).length === 0) {
      delete where.booking;
    }

    const [data, totalItems] = await Promise.all([
      this.repository.findAll({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              room: true,
              tenant: { select: { profile: { select: { fullName: true, fotoProfileUrl: true } } } }
            }
          }
        }
      }),
      this.repository.count(where),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      status: 200,
      message: 'Reviews fetched successfully',
      data,
      meta: { totalItems, page, perPage, totalPages }
    };
  }

  async findOne(id: string) {
    const data = await this.repository.findAll({
      where: { id },
      include: {
        booking: {
          select: {
            room: true,
            tenant: { select: { profile: true } }
          }
        }
      }
    });

    if (!data.length) throw new NotFoundException('Review not found');
    return { status: 200, message: 'Review fetched successfully', data: data[0] };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
    return { status: 200, message: 'Review deleted successfully', data: null };
  }
}
