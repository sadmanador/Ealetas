import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed 2 Admins
  const passwordHash = await bcrypt.hash('Admin1234!', 10);

  const admin1 = await prisma.adminUser.upsert({
    where: { email: 'admin1@ealetas.com' },
    update: {},
    create: {
      email: 'admin1@ealetas.com',
      password: passwordHash,
      name: 'Ealetas Head Curator',
      phone: '8801711000001',
      role: 'ADMIN',
    },
  });

  const admin2 = await prisma.adminUser.upsert({
    where: { email: 'admin2@ealetas.com' },
    update: {},
    create: {
      email: 'admin2@ealetas.com',
      password: passwordHash,
      name: 'Ealetas Logistics Manager',
      phone: '8801811000002',
      role: 'ADMIN',
    },
  });

  console.log('✅ Seeded 2 Admin accounts:', admin1.email, admin2.email);

  // 2. Seed Default Store Settings
  const settings = [
    { key: 'insideDhakaDeliveryCharge', value: '80' },
    { key: 'outsideDhakaDeliveryCharge', value: '120' },
    { key: 'smsAlertsEnabled', value: 'true' },
    { key: 'storeName', value: 'Ealetas Fine Jewelry' },
  ];

  for (const s of settings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('✅ Seeded Store Settings (Dhaka 80 BDT, Outside 120 BDT)');

  // 3. Seed Initial Jewelry Products (with 3 high-res images each, stock, wholesale price)
  const initialProducts = [
    {
      name: 'Aura Solitaire Diamond Ring',
      slug: 'aura-solitaire-diamond-ring',
      description: '1.2ct lab-grown diamond set in handcrafted 18k white gold. Meticulously cut to maximize light brilliance and clarity.',
      price: 18500,
      wholesaleCost: 12000,
      category: 'Rings',
      tags: 'Diamond,18k Gold,Solitaire,Bestseller',
      quantity: 12,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Lumina Pearl Drop Earrings',
      slug: 'lumina-pearl-drop-earrings',
      description: 'Lustrous freshwater baroque pearls accented with 14k yellow gold studs. Subtle movement and natural iridescence.',
      price: 7800,
      wholesaleCost: 4500,
      category: 'Earrings',
      tags: 'Pearl,14k Gold,Drop Earrings,New',
      quantity: 18,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Celestial Diamond Pendant',
      slug: 'celestial-diamond-pendant',
      description: 'A delicate constellation of brilliant cut diamonds on fine cable chain. Designed to catch light at every angle.',
      price: 14200,
      wholesaleCost: 9200,
      category: 'Necklaces',
      tags: 'Diamond,Gold,Pendant,Exclusive',
      quantity: 10,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611591475116-20092f03f364?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Seraphina Eternity Band',
      slug: 'seraphina-eternity-band',
      description: 'Continuous pavé-set round brilliant diamonds in polished platinum. Timeless symbol of everlasting grace.',
      price: 12900,
      wholesaleCost: 8500,
      category: 'Rings',
      tags: 'Platinum,Eternity,Diamonds,Classic',
      quantity: 15,
      isFeatured: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Sapphire Royal Choker',
      slug: 'sapphire-royal-choker',
      description: 'Deep royal blue Ceylon sapphire centerpiece embraced by a halo of micro-pavé diamonds on 18k yellow gold.',
      price: 24500,
      wholesaleCost: 16000,
      category: 'Necklaces',
      tags: 'Sapphire,18k Gold,Choker,Luxury',
      quantity: 6,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611591475116-20092f03f364?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Gilded Petal Studs',
      slug: 'gilded-petal-studs',
      description: 'Organic floral petals cast in 18k warm yellow gold with hand-textured brushed satin finish.',
      price: 5400,
      wholesaleCost: 3100,
      category: 'Earrings',
      tags: '18k Gold,Floral,Studs',
      quantity: 20,
      isFeatured: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      ]),
    },
  ];

  for (const prod of initialProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  console.log(`✅ Seeded ${initialProducts.length} jewelry products`);
  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
