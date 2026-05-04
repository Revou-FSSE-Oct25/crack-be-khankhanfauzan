import { PrismaPg } from '@prisma/adapter-pg';
import {
    PrismaClient, RoleType, MaritalStatus, RoomType, RoomStatus,
    BookingStatus, RentType, ComplaintCategory, ComplaintStatus,
    InvoiceStatus, TransactionStatus, NotificationType
} from '@prisma/client';
import * as argon2 from 'argon2';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting comprehensive seeding...');

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mail.com';
    const adminName = process.env.SEED_ADMIN_NAME || 'Test Admin';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    const tenantEmail = process.env.SEED_TENANT_EMAIL || 'tenant@mail.com';
    const tenantName = process.env.SEED_TENANT_NAME || 'Test Tenant';
    const tenantPassword = process.env.SEED_TENANT_PASSWORD || 'Tenant123!';

    // 1. FACILITIES
    const facilitiesData = [
        { name: 'WiFi', description: 'Kecepatan hingga 150 mbps', iconUrl: "WiFi" },
        { name: 'AC', description: '1/2 PK', iconUrl: "AirVent" },
        { name: 'Kamar Mandi Dalam', description: 'Ember, Gayung, dan Toilet Jongkok', iconUrl: "ShowerHead" },
        { name: 'Kasur', description: 'Spring bed queen size', iconUrl: "BedDouble" },
        { name: 'Lemari', description: 'Ukuran standar dengan 2 pintu', iconUrl: "Columns2" },
        { name: 'Meja Kerja', description: 'Ukuran standar dengan laci penyimpanan', iconUrl: "LampDesk" },
        { name: 'Kitchen Set', description: 'Meja dapur dan wastafel', iconUrl: "CookingPot" },
        { name: 'Listrik', description: 'Include listrik', iconUrl: "Zap" },
    ];

    const facilities: any[] = [];
    for (const data of facilitiesData) {
        const facility = await prisma.facility.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        });
        facilities.push(facility);
    }
    console.log('✅ Facilities seeded');

    // 2. USERS & PROFILES
    const hashedAdminPassword = await argon2.hash(adminPassword);
    const hashedTenantPassword = await argon2.hash(tenantPassword);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            role: RoleType.admin,
            isVerified: true,
            profile: {
                create: {
                    fullName: adminName,
                    isProfileComplete: true,
                }
            }
        },
    });

    const tenant = await prisma.user.upsert({
        where: { email: tenantEmail },
        update: {},
        create: {
            email: tenantEmail,
            password: hashedTenantPassword,
            role: RoleType.tenant,
            isVerified: true,
            profile: {
                create: {
                    fullName: tenantName,
                    whatsappNumber: '081234567890',
                    maritalStatus: MaritalStatus.single,
                    isProfileComplete: true,
                }
            }
        },
    });

    // Create another tenant for different conditions
    const tenant2 = await prisma.user.upsert({
        where: { email: 'tenant2@mail.com' },
        update: {},
        create: {
            email: 'tenant2@mail.com',
            password: hashedTenantPassword,
            role: RoleType.tenant,
            isVerified: true,
            profile: {
                create: {
                    fullName: 'Second Tenant',
                    whatsappNumber: '081299999999',
                    maritalStatus: MaritalStatus.married,
                    isProfileComplete: true,
                }
            }
        },
    });
    console.log('✅ Users & Profiles seeded');

    // 3. ROOMS
    const roomsData = [
        {
            building: 'Emerald House',
            roomNumber: '101',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.available,
            length: 4.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 1,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '102',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.available,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 2,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '103',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 3,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '104',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 4,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '105',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 5,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '106',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 6,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '107',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 1,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '108',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 2,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '109',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 3,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '110',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 4,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '111',
            floor: 1,
            roomType: RoomType.standard,
            priceMonthly: 1500000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 5,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '201',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1750000,
            status: RoomStatus.unavailable,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 1,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '202',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.available,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 2,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '203',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 3,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '204',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 4,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '205',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 5,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '206',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 1,
            gridColumn: 6,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '207',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 1,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '208',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1750000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 2,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '209',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 3,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '210',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 4,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald House',
            roomNumber: '211',
            floor: 2,
            roomType: RoomType.standard,
            priceMonthly: 1000000,
            status: RoomStatus.occupied,
            length: 5.5,
            width: 3.5,
            area: 19.25,
            unit: 'm',
            gridRow: 2,
            gridColumn: 5,
            facilitiesIds: [
                facilities[0].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald Home Stay',
            roomNumber: 'S1',
            floor: 1,
            roomType: RoomType.studio,
            priceMonthly: 2000000,
            status: RoomStatus.occupied,
            length: 7.0,
            width: 3.5,
            area: 24.5,
            unit: 'm',
            gridRow: 1,
            gridColumn: 1,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald Home Stay',
            roomNumber: 'S2',
            floor: 1,
            roomType: RoomType.studio,
            priceMonthly: 2000000,
            status: RoomStatus.occupied,
            length: 7.0,
            width: 3.5,
            area: 24.5,
            unit: 'm',
            gridRow: 1,
            gridColumn: 2,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
                facilities[7].id,
            ]
        },
        {
            building: 'Emerald Home Stay',
            roomNumber: 'S3',
            floor: 1,
            roomType: RoomType.studio,
            priceMonthly: 2000000,
            status: RoomStatus.occupied,
            length: 7.0,
            width: 3.5,
            area: 24.5,
            unit: 'm',
            gridRow: 1,
            gridColumn: 3,
            facilitiesIds: [
                facilities[0].id,
                facilities[1].id,
                facilities[2].id,
                facilities[3].id,
                facilities[4].id,
                facilities[5].id,
                facilities[6].id,
                facilities[7].id,
            ]
        },
    ];

    // Create all rooms iteratively using upsert to avoid unique constraint errors
    const seededRooms: any[] = [];
    for (const data of roomsData) {
        const { facilitiesIds, ...roomDetails } = data;

        // Check if room exists first because roomNumber is not marked @unique in schema
        let room = await prisma.room.findFirst({
            where: { roomNumber: roomDetails.roomNumber }
        });

        if (room) {
            room = await prisma.room.update({
                where: { id: room.id },
                data: {
                    ...roomDetails,
                    roomFacilities: {
                        deleteMany: {},
                        create: facilitiesIds.map(id => ({ facilityId: id }))
                    }
                }
            });
        } else {
            room = await prisma.room.create({
                data: {
                    ...roomDetails,
                    roomFacilities: {
                        create: facilitiesIds.map(id => ({ facilityId: id }))
                    }
                }
            });
        }
        seededRooms.push(room);
    }
    const room1 = seededRooms.find(r => r.roomNumber === '101')!;
    const room2 = seededRooms.find(r => r.roomNumber === '102')!;
    const room3 = seededRooms.find(r => r.roomNumber === '201')!;
    console.log('✅ Rooms seeded');

    // 4. BOOKINGS
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const booking1 = await prisma.booking.create({
        data: {
            tenantId: tenant.id,
            roomId: room1.id,
            rentType: RentType.monthly,
            duration: 1,
            startDate: today,
            endDate: nextMonth,
            pricePerUnit: 2500000,
            totalPrice: 2500000,
            status: BookingStatus.confirmed,
        }
    });

    const booking2 = await prisma.booking.create({
        data: {
            tenantId: tenant2.id,
            roomId: room2.id,
            rentType: RentType.daily,
            duration: 3,
            startDate: today,
            endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            pricePerUnit: 100000,
            totalPrice: 300000,
            status: BookingStatus.pending_payment,
        }
    });
    console.log('✅ Bookings seeded');

    // 5. INVOICES & TRANSACTIONS
    const invoice1 = await prisma.invoice.create({
        data: {
            bookingId: booking1.id,
            totalAmount: 2500000,
            dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            status: InvoiceStatus.paid,
            transactions: {
                create: {
                    amount: 2500000,
                    paymentMethod: 'Bank Transfer',
                    status: TransactionStatus.verified,
                    verifiedById: admin.id,
                    paidAt: new Date()
                }
            }
        }
    });

    const invoice2 = await prisma.invoice.create({
        data: {
            bookingId: booking2.id,
            totalAmount: 300000,
            dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
            status: InvoiceStatus.unpaid,
            transactions: {
                create: {
                    amount: 300000,
                    paymentMethod: 'E-Wallet',
                    status: TransactionStatus.pending,
                }
            }
        }
    });
    console.log('✅ Invoices & Transactions seeded');

    // 6. MAINTENANCE
    await prisma.maintenance.create({
        data: {
            tenantId: tenant.id,
            roomId: room1.id,
            category: ComplaintCategory.plumbing,
            description: 'Air keran tidak menyala',
            status: ComplaintStatus.open,
            images: ['https://example.com/image1.jpg']
        }
    });

    await prisma.maintenance.create({
        data: {
            tenantId: tenant.id,
            roomId: room1.id,
            category: ComplaintCategory.electrical,
            description: 'Lampu kamar mandi mati',
            status: ComplaintStatus.resolved,
            adminNotes: 'Lampu sudah diganti oleh teknisi',
        }
    });
    console.log('✅ Maintenance records seeded');

    // 7. REVIEWS
    await prisma.review.create({
        data: {
            bookingId: booking1.id,
            rating: 5,
            comment: 'Sangat nyaman dan bersih!',
        }
    });
    console.log('✅ Reviews seeded');

    // 8. CONVERSATIONS & MESSAGES
    const conversation = await prisma.conversation.create({
        data: {
            tenantId: tenant.id,
            lastMessage: 'Halo admin, mau tanya soal wifi',
            messages: {
                create: [
                    { senderId: tenant.id, messageText: 'Halo admin, mau tanya soal wifi' },
                    { senderId: admin.id, messageText: 'Halo mas, ada yang bisa dibantu?' }
                ]
            }
        }
    });
    console.log('✅ Conversations & Messages seeded');

    // 9. NOTIFICATIONS
    await prisma.notification.create({
        data: {
            userId: tenant.id,
            title: 'Pembayaran Berhasil',
            message: 'Terima kasih, pembayaran invoice anda telah diverifikasi.',
            type: NotificationType.payment,
            isRead: false,
        }
    });
    console.log('✅ Notifications seeded');

    console.log('🎉 All comprehensive seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });