"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Hatly Egypt Database Seeding...');
    // 1. Password hashing
    const defaultPassword = await bcryptjs_1.default.hash('hatly123', 10);
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    // 2. Clear existing data
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.store.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.walletTransaction.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.promoCode.deleteMany();
    await prisma.pricingRule.deleteMany();
    await prisma.user.deleteMany();
    // 3. Create Admin User
    const admin = await prisma.user.create({
        data: {
            name: 'مدير نظام هاتلي (Super Admin)',
            phone: '01000000001',
            email: 'admin@hatly.eg',
            passwordHash: adminPassword,
            role: 'ADMIN',
            language: 'ar',
            walletBalance: 10000.0,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        },
    });
    // 4. Create Demo Customer
    const customer = await prisma.user.create({
        data: {
            name: 'أحمد مصطفى (Ahmed Moustafa)',
            phone: '01011112222',
            email: 'customer@hatly.eg',
            passwordHash: defaultPassword,
            role: 'CUSTOMER',
            language: 'ar',
            walletBalance: 750.0,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
        },
    });
    // 5. Create Demo Drivers
    const driverUser1 = await prisma.user.create({
        data: {
            name: 'محمود إبراهيم (Mahmoud Ibrahim)',
            phone: '01022223333',
            email: 'driver1@hatly.eg',
            passwordHash: defaultPassword,
            role: 'DRIVER',
            language: 'ar',
            walletBalance: 420.0,
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
        },
    });
    const driver1 = await prisma.driver.create({
        data: {
            userId: driverUser1.id,
            vehicleType: 'CAR',
            vehicleModel: 'Hyundai Elantra 2023',
            vehiclePlate: 'س ق ص 7894',
            vehicleYear: 2023,
            vehicleColor: 'فضي / Silver',
            licenseNumber: 'DL-EGY-987654',
            nationalId: '29508140102345',
            verificationStatus: 'APPROVED',
            isOnline: true,
            currentLat: 30.0571, // Zamalek, Cairo
            currentLng: 31.2223,
            lastLocationUpdate: new Date(),
            rating: 4.95,
            totalTrips: 214,
            totalEarnings: 8650.0,
            commissionOwed: 420.0,
            drivingLicenseDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            vehicleRegDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            criminalRecordDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        },
    });
    const driverUser2 = await prisma.user.create({
        data: {
            name: 'كريم يوسف (Karim Youssef)',
            phone: '01033334444',
            email: 'driver2@hatly.eg',
            passwordHash: defaultPassword,
            role: 'DRIVER',
            language: 'ar',
            walletBalance: 290.0,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        },
    });
    const driver2 = await prisma.driver.create({
        data: {
            userId: driverUser2.id,
            vehicleType: 'SCOOTER',
            vehicleModel: 'Honda Dio 110cc',
            vehiclePlate: 'د ر ج 4321',
            vehicleYear: 2022,
            vehicleColor: 'أحمر / Red',
            licenseNumber: 'DL-EGY-554433',
            nationalId: '29811220104321',
            verificationStatus: 'APPROVED',
            isOnline: true,
            currentLat: 30.0626, // Nasr City, Cairo
            currentLng: 31.3400,
            lastLocationUpdate: new Date(),
            rating: 4.88,
            totalTrips: 145,
            totalEarnings: 4200.0,
            commissionOwed: 195.0,
            drivingLicenseDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            vehicleRegDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            criminalRecordDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        },
    });
    const driverUserPending = await prisma.user.create({
        data: {
            name: 'عمر خالد (Omar Khaled)',
            phone: '01044445555',
            email: 'driver3@hatly.eg',
            passwordHash: defaultPassword,
            role: 'DRIVER',
            language: 'ar',
            walletBalance: 0.0,
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        },
    });
    await prisma.driver.create({
        data: {
            userId: driverUserPending.id,
            vehicleType: 'VAN',
            vehicleModel: 'Toyota HiAce 2021',
            vehiclePlate: 'ط ي ف 5566',
            vehicleYear: 2021,
            vehicleColor: 'أبيض / White',
            licenseNumber: 'DL-EGY-112233',
            nationalId: '29001010109988',
            verificationStatus: 'PENDING',
            isOnline: false,
            rating: 5.0,
            drivingLicenseDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            vehicleRegDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
            criminalRecordDoc: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
        },
    });
    // 6. Create Stores (Restaurant, Supermarket, Pharmacy)
    const storeUser1 = await prisma.user.create({
        data: {
            name: 'كشري أبو طارق (Abou Tarek)',
            phone: '01055556666',
            email: 'aboutarek@hatly.eg',
            passwordHash: defaultPassword,
            role: 'STORE_OWNER',
            language: 'ar',
            walletBalance: 12500.0,
        },
    });
    const store1 = await prisma.store.create({
        data: {
            ownerId: storeUser1.id,
            type: 'RESTAURANT',
            nameAr: 'كشري أبو طارق',
            nameEn: 'Koshary Abou Tarek',
            descriptionAr: 'أشهر وأعرق كشري في مصر والعالم العربي بجودة ومذاق لا يقاوم',
            descriptionEn: 'The most legendary Egyptian Koshary brand since 1950',
            logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
            address: '١٦ شارع معروف، متفرع من شارع شامبليون، وسط البلد، القاهرة',
            latitude: 30.0519,
            longitude: 31.2393,
            phone: '16788',
            rating: 4.9,
            deliveryTimeMin: 25,
            deliveryFee: 15.0,
            minimumOrder: 40.0,
            isOpen: true,
            commissionRate: 15.0,
        },
    });
    const cat1 = await prisma.category.create({
        data: {
            storeId: store1.id,
            nameAr: 'أطباق الكشري المميزة',
            nameEn: 'Signature Koshary Bowls',
            sortOrder: 1,
        },
    });
    await prisma.product.createMany({
        data: [
            {
                storeId: store1.id,
                categoryId: cat1.id,
                nameAr: 'كشري خصوصي سوبر',
                nameEn: 'Super Special Koshary',
                descriptionAr: 'مزيج المكرونة والأرز والعدس مع صلصة الطماطم السرية والتقلية المقرمشة',
                descriptionEn: 'Classic rice, lentils, pasta, crispy fried onions, secret spicy sauce',
                price: 45.0,
                originalPrice: 50.0,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                isAvailable: true,
            },
            {
                storeId: store1.id,
                categoryId: cat1.id,
                nameAr: 'كشري ميجا هاتلي العائلي',
                nameEn: 'Mega Hatly Family Koshary',
                descriptionAr: 'طبق عائلي ضخم يكفي ٤ أشخاص مع إضافات دقة وصلصة وتقلية مضاعفة',
                descriptionEn: 'Giant family bowl serving 4 persons with extra toppings',
                price: 95.0,
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
                isAvailable: true,
            },
            {
                storeId: store1.id,
                categoryId: cat1.id,
                nameAr: 'طاجن لحمة مفرومة بلدي بالفرن',
                nameEn: 'Minced Beef Oven Pasta Casserole',
                descriptionAr: 'طاجن مكرونة بالصلصة الغنية واللحمة البقري المتبلة في الفرن الحجري',
                descriptionEn: 'Stone-baked pasta casserole with seasoned Egyptian minced beef',
                price: 65.0,
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
                isAvailable: true,
            },
        ],
    });
    const cat2 = await prisma.category.create({
        data: {
            storeId: store1.id,
            nameAr: 'الحلويات والمشروبات',
            nameEn: 'Desserts & Beverages',
            sortOrder: 2,
        },
    });
    await prisma.product.createMany({
        data: [
            {
                storeId: store1.id,
                categoryId: cat2.id,
                nameAr: 'أرز باللبن بالمكسرات والقشطة',
                nameEn: 'Creamy Rice Pudding with Nuts',
                descriptionAr: 'أرز باللبن الطبيعي الفلاحي مع رشة فستق وقشطة طازجة',
                descriptionEn: 'Authentic rich rice pudding topped with fresh clotted cream and pistachios',
                price: 30.0,
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
                isAvailable: true,
            },
            {
                storeId: store1.id,
                categoryId: cat2.id,
                nameAr: 'أم علي بالفرن بالمكسرات',
                nameEn: 'Oven-Baked Om Ali',
                descriptionAr: 'رقائق المعجنات المقرمشة مع الحليب الساخن والمكسرات الفاخرة',
                descriptionEn: 'Warm puff pastry soaked in sweetened rich milk and nuts',
                price: 40.0,
                image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=300&fit=crop',
                isAvailable: true,
            },
        ],
    });
    // Store 2: Supermarket
    const storeUser2 = await prisma.user.create({
        data: {
            name: 'هايبر وان ماركت (HyperOne)',
            phone: '01066667777',
            email: 'hyperone@hatly.eg',
            passwordHash: defaultPassword,
            role: 'STORE_OWNER',
            language: 'ar',
            walletBalance: 24000.0,
        },
    });
    const store2 = await prisma.store.create({
        data: {
            ownerId: storeUser2.id,
            type: 'SUPERMARKET',
            nameAr: 'سوبرماركت هايبر وان',
            nameEn: 'HyperOne Supermarket',
            descriptionAr: 'كل احتياجات بيتك من المنتجات الغذائية والمنظفات والخضار الطازج بأفضل سعر',
            descriptionEn: 'Fresh groceries, dairy, produce, and household essentials',
            logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop',
            address: 'مدخل الشيخ زايد ١، طريق مصر الإسكندرية الصحراوي',
            latitude: 30.0131,
            longitude: 30.9833,
            phone: '16401',
            rating: 4.85,
            deliveryTimeMin: 40,
            deliveryFee: 20.0,
            minimumOrder: 80.0,
            isOpen: true,
            commissionRate: 12.0,
        },
    });
    const catMarket = await prisma.category.create({
        data: {
            storeId: store2.id,
            nameAr: 'الألبان والبيض والخضروات',
            nameEn: 'Dairy, Eggs & Fresh Produce',
            sortOrder: 1,
        },
    });
    await prisma.product.createMany({
        data: [
            {
                storeId: store2.id,
                categoryId: catMarket.id,
                nameAr: 'حليب كامل الدسم المراعي ١ لتر',
                nameEn: 'Almarai Full Cream Milk 1L',
                price: 42.0,
                image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
                isAvailable: true,
            },
            {
                storeId: store2.id,
                categoryId: catMarket.id,
                nameAr: 'طبق بيض أحمر مزارع ٣٠ بيضة',
                nameEn: 'Farm Fresh Red Eggs (30 pack)',
                price: 165.0,
                image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop',
                isAvailable: true,
            },
            {
                storeId: store2.id,
                categoryId: catMarket.id,
                nameAr: 'كيلو طماطم فاخرة للسلطة والطبخ',
                nameEn: 'Fresh Premium Tomatoes 1kg',
                price: 20.0,
                image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
                isAvailable: true,
            },
        ],
    });
    // Store 3: Pharmacy
    const storeUser3 = await prisma.user.create({
        data: {
            name: 'صيدليات العزبي (El Ezaby Pharmacy)',
            phone: '01077778888',
            email: 'elezaby@hatly.eg',
            passwordHash: defaultPassword,
            role: 'STORE_OWNER',
            language: 'ar',
            walletBalance: 8700.0,
        },
    });
    const store3 = await prisma.store.create({
        data: {
            ownerId: storeUser3.id,
            type: 'PHARMACY',
            nameAr: 'صيدليات العزبي',
            nameEn: 'El Ezaby Pharmacy',
            descriptionAr: 'صحتك ورعايتك على مدار الساعة، أدوية ومستحضرات تجميل ومكملات غذائية',
            descriptionEn: '24/7 Health and wellness care, prescription medicines and skincare',
            logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=200&h=200&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&h=400&fit=crop',
            address: 'شارع ٩، المعادي، القاهرة',
            latitude: 29.9585,
            longitude: 31.2789,
            phone: '19600',
            rating: 4.9,
            deliveryTimeMin: 20,
            deliveryFee: 15.0,
            minimumOrder: 30.0,
            isOpen: true,
            commissionRate: 10.0,
        },
    });
    const catPharm = await prisma.category.create({
        data: {
            storeId: store3.id,
            nameAr: 'الإسعافات الأولية والفيتامينات',
            nameEn: 'First Aid & Vitamins',
            sortOrder: 1,
        },
    });
    await prisma.product.createMany({
        data: [
            {
                storeId: store3.id,
                categoryId: catPharm.id,
                nameAr: 'بانادول إكسترا ٥٠٠ مجم (٢٤ قرص)',
                nameEn: 'Panadol Extra 500mg (24 tablets)',
                price: 48.0,
                image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
                isAvailable: true,
            },
            {
                storeId: store3.id,
                categoryId: catPharm.id,
                nameAr: 'فيتامين سي فوار ١٠٠٠ مجم بنكهة البرتقال',
                nameEn: 'Effervescent Vitamin C 1000mg Orange',
                price: 65.0,
                image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&h=300&fit=crop',
                isAvailable: true,
            },
        ],
    });
    // 7. Seed Dynamic Pricing Rules
    await prisma.pricingRule.createMany({
        data: [
            {
                serviceType: 'RIDE',
                rideSubtype: 'ECONOMY',
                nameAr: 'هاتلي رايد اقتصادي (Hatly Go)',
                nameEn: 'Hatly Ride Economy',
                baseFare: 16.0,
                perKmRate: 4.2,
                perMinuteRate: 0.9,
                minimumFare: 22.0,
                serviceFee: 5.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 15.0,
                isActive: true,
            },
            {
                serviceType: 'RIDE_COMFORT',
                rideSubtype: 'COMFORT',
                nameAr: 'هاتلي كومفورت (Hatly Comfort)',
                nameEn: 'Hatly Ride Comfort',
                baseFare: 24.0,
                perKmRate: 5.8,
                perMinuteRate: 1.3,
                minimumFare: 35.0,
                serviceFee: 6.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 18.0,
                isActive: true,
            },
            {
                serviceType: 'RIDE_SCOOTER',
                rideSubtype: 'SCOOTER',
                nameAr: 'هاتلي موتو / سكوتر (Hatly Moto)',
                nameEn: 'Hatly Scooter Ride',
                baseFare: 10.0,
                perKmRate: 2.8,
                perMinuteRate: 0.6,
                minimumFare: 16.0,
                serviceFee: 3.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 12.0,
                isActive: true,
            },
            {
                serviceType: 'RIDE_VAN',
                rideSubtype: 'VAN',
                nameAr: 'هاتلي فان ٧ راكب (Hatly Van)',
                nameEn: 'Hatly 7-Seater Van',
                baseFare: 38.0,
                perKmRate: 7.5,
                perMinuteRate: 1.8,
                minimumFare: 55.0,
                serviceFee: 8.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 20.0,
                isActive: true,
            },
            {
                serviceType: 'FOOD',
                nameAr: 'توصيل مطاعم هاتلي فود',
                nameEn: 'Hatly Food Delivery',
                baseFare: 18.0,
                perKmRate: 3.5,
                perMinuteRate: 0.5,
                minimumFare: 20.0,
                serviceFee: 5.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 15.0,
                isActive: true,
            },
            {
                serviceType: 'EXPRESS',
                nameAr: 'هاتلي إكسبريس (شحنات وطرود سريعة)',
                nameEn: 'Hatly Express Package Courier',
                baseFare: 25.0,
                perKmRate: 4.0,
                perMinuteRate: 0.8,
                minimumFare: 30.0,
                serviceFee: 5.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 15.0,
                isActive: true,
            },
            {
                serviceType: 'MARKET',
                nameAr: 'توصيل بقالة وسوبرماركت',
                nameEn: 'Hatly Grocery & Supermarket',
                baseFare: 20.0,
                perKmRate: 3.5,
                perMinuteRate: 0.5,
                minimumFare: 25.0,
                serviceFee: 5.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 15.0,
                isActive: true,
            },
            {
                serviceType: 'SHOPPING',
                nameAr: 'هاتلي شوبينج ومشتريات المتاجر',
                nameEn: 'Hatly Store Shopping',
                baseFare: 25.0,
                perKmRate: 4.0,
                perMinuteRate: 0.8,
                minimumFare: 30.0,
                serviceFee: 5.0,
                surgeMultiplier: 1.0,
                driverCommissionPercent: 15.0,
                isActive: true,
            },
        ],
    });
    // 8. Seed Promo Codes
    await prisma.promoCode.createMany({
        data: [
            {
                code: 'HATLY20',
                discountPercent: 20,
                maxDiscount: 40,
                minOrderAmount: 80,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                usageLimit: 5000,
                usedCount: 142,
                isActive: true,
            },
            {
                code: 'WELCOME',
                discountPercent: 30,
                maxDiscount: 50,
                minOrderAmount: 50,
                expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                usageLimit: 10000,
                usedCount: 620,
                isActive: true,
            },
            {
                code: 'EGYPT2026',
                discountPercent: 15,
                maxDiscount: 35,
                minOrderAmount: 60,
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                usageLimit: 3000,
                usedCount: 88,
                isActive: true,
            },
        ],
    });
    // 9. Create a Sample Active Order
    const activeOrder = await prisma.order.create({
        data: {
            orderNumber: 'HAT-10492',
            customerId: customer.id,
            driverId: driver1.id,
            storeId: store1.id,
            serviceType: 'FOOD',
            status: 'DRIVER_ASSIGNED',
            pickupAddress: 'كشري أبو طارق - شارع شامبليون، وسط البلد',
            pickupLat: 30.0519,
            pickupLng: 31.2393,
            dropoffAddress: 'برج النيل، الزمالك، القاهرة',
            dropoffLat: 30.0612,
            dropoffLng: 31.2185,
            distanceKm: 3.4,
            durationMinutes: 14,
            subtotal: 110.0,
            deliveryFee: 25.0,
            serviceFee: 5.0,
            tax: 0.0,
            discount: 20.0,
            totalAmount: 120.0,
            driverEarnings: 21.25,
            platformFee: 8.75,
            paymentMethod: 'CASH',
            paymentStatus: 'PENDING',
            promoCodeApplied: 'HATLY20',
            customerNotes: 'من فضلك الشطة والدقة برة الكشري',
        },
    });
    console.log('✅ Hatly Egypt Database Seeding Completed Successfully!');
    console.log('👤 Admin: 01000000001 (pass: admin123)');
    console.log('👤 Customer: 01011112222 (pass: hatly123)');
    console.log('🚗 Driver: 01022223333 (pass: hatly123)');
    console.log('🍽️ Restaurant: 01055556666 (pass: hatly123)');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
