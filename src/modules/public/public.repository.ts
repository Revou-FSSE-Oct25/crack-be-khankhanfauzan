import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PublicRepository {
    constructor(private readonly prisma: PrismaService) {

    }

    async getLandingPageData() {
        const [cheapestRoom, facilities, reviewStats, featuredReviews] = await Promise.all([

            // check cheapest room with monthly price
            this.prisma.room.findFirst(
                {
                    orderBy: { priceMonthly: 'asc' },
                    select: {
                        priceMonthly: true,
                        roomType: true,
                        length: true,
                        width: true,
                        unit: true,
                    }
                }
            ),

            //  get all facilities
            this.prisma.facility.findMany({
                select: {
                    id: true,
                    name: true,
                    iconUrl: true,
                }
            }),

            // calculate review stat
            this.prisma.review.aggregate({
                _avg: { rating: true },
                _count: { id: true },
            }),

            // get 5 top review
            this.prisma.review.findMany({
                where: { rating: { gte: 4 } },
                orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
                take: 5,
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    booking: {
                        select: {
                            tenant: {
                                select: {
                                    profile: {
                                        select: { fullName: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
        ]);

        return { cheapestRoom, facilities, reviewStats, featuredReviews };
    }
}