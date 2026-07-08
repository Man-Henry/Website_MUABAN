/**
 * @fileoverview Seed script — nạp dữ liệu mẫu vào PostgreSQL.
 * Chạy: npm run seed
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = '123456Aa'; // Thoả mãn regex: chữ hoa + số + >= 8 ký tự

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // Xoá dữ liệu cũ
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-001', email: 'nguyenvana@email.com', password: hashedPassword,
        displayName: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=user-001',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-002', email: 'tranthib@email.com', password: hashedPassword,
        displayName: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=user-002',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-003', email: 'levanc@email.com', password: hashedPassword,
        displayName: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=user-003',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-004', email: 'phamthid@email.com', password: hashedPassword,
        displayName: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=user-004',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-005', email: 'hoangvane@email.com', password: hashedPassword,
        displayName: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?u=user-005',
      },
    }),
  ]);
  console.log(`✅ Đã tạo ${users.length} users`);

  // ---------------------------------------------------------------------------
  // Listings
  // ---------------------------------------------------------------------------
  const listingsData = [
    { id: 'listing-001', title: 'iPhone 13 Pro Max 256GB - Xanh Sierra', category: 'electronics' as const, description: 'Máy còn mới 98%, pin 92%, đã dán kính cường lực, kèm ốp lưng và sạc nhanh 20W chính hãng.', price: 15500000, negotiable: true, condition: 'like_new' as const, status: 'active' as const, sellerId: 'user-002', createdAt: daysAgo(2), images: ['https://picsum.photos/seed/iphone13/600/600', 'https://picsum.photos/seed/iphone13b/600/600'] },
    { id: 'listing-002', title: 'Áo khoác dạ Hàn Quốc - Size M', category: 'fashion' as const, description: 'Áo khoác dạ tweed phong cách Hàn Quốc, mặc đúng 2 lần, còn tag giá. Chất vải dày dặn.', price: 350000, negotiable: false, condition: 'like_new' as const, status: 'active' as const, sellerId: 'user-001', createdAt: daysAgo(1), images: ['https://picsum.photos/seed/jacket/600/600'] },
    { id: 'listing-003', title: 'Bàn làm việc gỗ thông tự nhiên 120x60', category: 'furniture' as const, description: 'Bàn làm việc gỗ thông nhập khẩu, bề mặt phủ sơn PU chống nước. Kích thước 120x60x75cm.', price: 1200000, negotiable: true, condition: 'good' as const, status: 'active' as const, sellerId: 'user-003', createdAt: daysAgo(5), images: ['https://picsum.photos/seed/desk/600/600', 'https://picsum.photos/seed/deskb/600/600'] },
    { id: 'listing-004', title: 'Nồi chiên không dầu Philips 4.1L', category: 'household' as const, description: 'Nồi chiên không dầu Philips HD9200 chính hãng, dung tích 4.1L. Sử dụng 6 tháng.', price: 800000, negotiable: true, condition: 'good' as const, status: 'active' as const, sellerId: 'user-004', createdAt: daysAgo(3), images: ['https://picsum.photos/seed/airfryer/600/600'] },
    { id: 'listing-005', title: 'MacBook Air M1 2020 - 8GB/256GB', category: 'electronics' as const, description: 'MacBook Air M1 Gold, 8GB RAM, 256GB SSD. Pin cycle count 120. Máy nguyên zin.', price: 12000000, negotiable: true, condition: 'good' as const, status: 'active' as const, sellerId: 'user-005', createdAt: daysAgo(7), images: ['https://picsum.photos/seed/macbook/600/600', 'https://picsum.photos/seed/macbookb/600/600'] },
    { id: 'listing-006', title: 'Giày Nike Air Force 1 White - Size 42', category: 'fashion' as const, description: 'Giày Nike AF1 trắng hàng chính hãng, mua tại Nike Store. Full box + bill.', price: 1500000, negotiable: false, condition: 'like_new' as const, status: 'active' as const, sellerId: 'user-002', createdAt: daysAgo(4), images: ['https://picsum.photos/seed/nike/600/600'] },
    { id: 'listing-007', title: 'Tủ quần áo 3 cánh gỗ MDF', category: 'furniture' as const, description: 'Tủ quần áo 3 cánh lớn, chất liệu gỗ MDF phủ melamine chống ẩm. 160x200x55cm.', price: 2500000, negotiable: true, condition: 'fair' as const, status: 'active' as const, sellerId: 'user-003', createdAt: daysAgo(10), images: ['https://picsum.photos/seed/wardrobe/600/600'] },
    { id: 'listing-008', title: 'Máy hút bụi cầm tay Dyson V8', category: 'household' as const, description: 'Dyson V8 Slim Fluffy chính hãng, pin sử dụng 30 phút. Kèm 3 đầu hút.', price: 3500000, negotiable: true, condition: 'good' as const, status: 'active' as const, sellerId: 'user-005', createdAt: daysAgo(6), images: ['https://picsum.photos/seed/dyson/600/600', 'https://picsum.photos/seed/dysonb/600/600'] },
    { id: 'listing-009', title: 'Tai nghe Sony WH-1000XM4 - Đen', category: 'electronics' as const, description: 'Tai nghe chống ồn Sony XM4 màu đen. Pin 30 giờ, đệm tai còn mới.', price: 3200000, negotiable: false, condition: 'like_new' as const, status: 'sold' as const, sellerId: 'user-001', createdAt: daysAgo(15), images: ['https://picsum.photos/seed/sonyxm4/600/600'] },
    { id: 'listing-010', title: 'Bộ bát đĩa sứ Bát Tràng 12 món', category: 'household' as const, description: 'Bộ bát đĩa sứ Bát Tràng cao cấp gồm 12 món. Chưa qua sử dụng.', price: 450000, negotiable: true, condition: 'new_item' as const, status: 'active' as const, sellerId: 'user-004', createdAt: daysAgo(8), images: ['https://picsum.photos/seed/ceramics/600/600'] },
    { id: 'listing-011', title: 'Váy maxi hoa nhí vintage', category: 'fashion' as const, description: 'Váy maxi dáng xòe họa tiết hoa nhí, phong cách vintage Hàn Quốc.', price: 180000, negotiable: false, condition: 'good' as const, status: 'active' as const, sellerId: 'user-002', createdAt: daysAgo(3), images: ['https://picsum.photos/seed/dress/600/600'] },
    { id: 'listing-012', title: 'Ghế gaming DXRacer Formula Series', category: 'furniture' as const, description: 'Ghế gaming DXRacer chính hãng, khung thép chịu lực 120kg.', price: 3800000, negotiable: true, condition: 'good' as const, status: 'active' as const, sellerId: 'user-001', createdAt: daysAgo(12), images: ['https://picsum.photos/seed/gamingchair/600/600'] },
    { id: 'listing-013', title: 'Sách "Sapiens - Lược sử loài người"', category: 'other' as const, description: 'Sách Sapiens bản tiếng Việt, NXB Thế Giới. Sách còn mới.', price: 95000, negotiable: false, condition: 'like_new' as const, status: 'active' as const, sellerId: 'user-005', createdAt: daysAgo(9), images: ['https://picsum.photos/seed/sapiens/600/600'] },
    { id: 'listing-014', title: 'Loa Bluetooth JBL Flip 5 - Đỏ', category: 'electronics' as const, description: 'Loa JBL Flip 5 chính hãng màu đỏ, chống nước IPX7, pin 12 tiếng.', price: 1600000, negotiable: true, condition: 'good' as const, status: 'sold' as const, sellerId: 'user-001', createdAt: daysAgo(20), images: ['https://picsum.photos/seed/jblflip5/600/600'] },
    { id: 'listing-015', title: 'Balo laptop Tomtoc 15.6 inch - Xanh Navy', category: 'fashion' as const, description: 'Balo Tomtoc chống sốc cho laptop 15.6 inch, chất liệu chống nước.', price: 550000, negotiable: false, condition: 'like_new' as const, status: 'active' as const, sellerId: 'user-003', createdAt: daysAgo(1), images: ['https://picsum.photos/seed/backpack/600/600'] },
    { id: 'listing-016', title: 'Nồi cơm điện Cuckoo 1.8L', category: 'household' as const, description: 'Nồi cơm điện Cuckoo Hàn Quốc dung tích 1.8L, nấu cơm ngon, giữ ấm tốt.', price: 600000, negotiable: true, condition: 'good' as const, status: 'active' as const, sellerId: 'user-004', createdAt: daysAgo(11), images: ['https://picsum.photos/seed/ricecooker/600/600'] },
  ];

  for (const l of listingsData) {
    await prisma.listing.create({
      data: {
        id: l.id, title: l.title, category: l.category, description: l.description,
        price: l.price, negotiable: l.negotiable, condition: l.condition, status: l.status,
        sellerId: l.sellerId, createdAt: l.createdAt,
        images: { create: l.images.map((url, i) => ({ id: `img-${l.id}-${i}`, url })) },
      },
    });
  }
  console.log(`✅ Đã tạo ${listingsData.length} listings`);

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  const reviewsData = [
    { listingId: 'listing-001', reviewerId: 'user-001', sellerId: 'user-002', rating: 5, comment: 'Máy như mô tả, giao hàng nhanh. Người bán rất thân thiện!', createdAt: daysAgo(1) },
    { listingId: 'listing-003', reviewerId: 'user-005', sellerId: 'user-003', rating: 4, comment: 'Bàn đẹp, chất lượng tốt. Giao hơi chậm nhưng đóng gói cẩn thận.', createdAt: daysAgo(3) },
    { listingId: 'listing-004', reviewerId: 'user-001', sellerId: 'user-004', rating: 5, comment: 'Nồi chiên hoạt động tốt, giá hợp lý. Cảm ơn bạn!', createdAt: daysAgo(5) },
    { listingId: 'listing-006', reviewerId: 'user-004', sellerId: 'user-002', rating: 4, comment: 'Giày đẹp, hàng chính hãng. Nhưng size hơi chật.', createdAt: daysAgo(2) },
    { listingId: 'listing-005', reviewerId: 'user-002', sellerId: 'user-005', rating: 3, comment: 'Máy ổn nhưng pin yếu hơn mô tả một chút.', createdAt: daysAgo(8) },
  ];

  for (const r of reviewsData) {
    await prisma.review.create({ data: r });
  }
  console.log(`✅ Đã tạo ${reviewsData.length} reviews`);

  // ---------------------------------------------------------------------------
  // Conversations & Messages
  // ---------------------------------------------------------------------------
  const conv1 = await prisma.conversation.create({
    data: {
      id: 'conv-001',
      listingId: 'listing-001', listingTitle: 'iPhone 13 Pro Max 256GB', listingImage: 'https://picsum.photos/seed/iphone13/600/600',
      participants: { create: [{ userId: 'user-001' }, { userId: 'user-002' }] },
      messages: {
        create: [
          { senderId: 'user-001', content: 'Chào bạn, iPhone 13 Pro Max này còn không ạ?', createdAt: daysAgo(1) },
          { senderId: 'user-002', content: 'Dạ chào anh, máy vẫn còn ạ. Anh muốn xem máy trực tiếp không?', createdAt: daysAgo(1) },
          { senderId: 'user-001', content: 'Được, bạn có thể gửi thêm ảnh thực tế pin được không?', createdAt: daysAgo(0) },
          { senderId: 'user-002', content: 'Dạ vâng, em sẽ kiểm tra lại và báo anh nhé!', createdAt: daysAgo(0) },
        ],
      },
    },
  });

  const conv2 = await prisma.conversation.create({
    data: {
      id: 'conv-002',
      listingId: 'listing-003', listingTitle: 'Bàn làm việc gỗ thông', listingImage: 'https://picsum.photos/seed/desk/600/600',
      participants: { create: [{ userId: 'user-001' }, { userId: 'user-003' }] },
      messages: {
        create: [
          { senderId: 'user-001', content: 'Anh ơi, bàn này có ship không ạ?', createdAt: daysAgo(3) },
          { senderId: 'user-003', content: 'Có ship nhé, phí ship tuỳ khu vực. Em ở đâu?', createdAt: daysAgo(3) },
          { senderId: 'user-001', content: 'Em ở quận 7 ạ. Bàn dùng bao lâu rồi anh?', createdAt: daysAgo(2) },
          { senderId: 'user-001', content: 'Bàn này giao hàng được không ạ?', createdAt: daysAgo(1) },
        ],
      },
    },
  });

  const conv3 = await prisma.conversation.create({
    data: {
      id: 'conv-003',
      listingId: 'listing-004', listingTitle: 'Nồi chiên không dầu Philips', listingImage: 'https://picsum.photos/seed/airfryer/600/600',
      participants: { create: [{ userId: 'user-001' }, { userId: 'user-004' }] },
      messages: {
        create: [
          { senderId: 'user-004', content: 'Chào anh, nồi chiên Philips có giảm giá thêm không ạ?', createdAt: daysAgo(3) },
          { senderId: 'user-001', content: 'Chào bạn, giá đã fix rồi nhé, 800k thôi ạ.', createdAt: daysAgo(3) },
          { senderId: 'user-004', content: 'Dạ vậy anh có giao hàng không?', createdAt: daysAgo(2) },
          { senderId: 'user-004', content: 'Nồi chiên vẫn còn bảo hành không anh?', createdAt: daysAgo(2) },
        ],
      },
    },
  });

  console.log(`✅ Đã tạo 3 conversations với messages`);

  console.log('\n🎉 Seed hoàn tất!');
  console.log('📧 Tài khoản mẫu: nguyenvana@email.com / 123456Aa');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
