import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding diverse color-variant products for customer flow testing...');

  const multiVariantProducts = [
    {
      name: 'Aurora Crystal Teardrop Necklace',
      slug: 'aurora-crystal-teardrop-necklace',
      description: 'Luminous faceted crystal teardrop pendant crafted in high-luster setting. Available in ocean blue, emerald green, and champagne rose crystals.',
      price: 1450,
      wholesaleCost: 720,
      category: 'Necklaces',
      tags: 'Ocean,Crystal,New Arrival,Trending',
      isFeatured: true,
      commonImages: JSON.stringify([
        '/theme/cat-necklaces.png',
        '/theme/brand-story-shell.png',
      ]),
      images: JSON.stringify([
        '/theme/product-ocean-blue-necklace.png',
      ]),
      variants: [
        {
          colorName: 'Ocean Sapphire Blue',
          colorCode: '#0f388a',
          quantity: 18,
          images: JSON.stringify([
            '/theme/product-ocean-blue-necklace.png',
            '/theme/cat-necklaces.png',
          ]),
        },
        {
          colorName: 'Emerald Green',
          colorCode: '#107c41',
          quantity: 12,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-necklaces.png',
          ]),
        },
        {
          colorName: 'Champagne Rose',
          colorCode: '#e89cae',
          quantity: 8,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1611591475870-87ef8740c885?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-necklaces.png',
          ]),
        },
      ],
    },
    {
      name: 'Lustrous Freshwater Pearl Ring',
      slug: 'lustrous-freshwater-pearl-ring',
      description: 'Hand-selected button freshwater pearl set between sparkling micro-pave zirconia crystals. Choose from Classic 18K Yellow Gold or Royal Rose Gold vermeil.',
      price: 1150,
      wholesaleCost: 550,
      category: 'Rings',
      tags: 'Pearl,Luxury,Best Seller',
      isFeatured: true,
      commonImages: JSON.stringify([
        '/theme/cat-rings.png',
        '/theme/cat-pearls.png',
      ]),
      images: JSON.stringify([
        '/theme/product-floral-crystal-ring.png',
      ]),
      variants: [
        {
          colorName: '18K Yellow Gold',
          colorCode: '#d4af37',
          quantity: 15,
          images: JSON.stringify([
            '/theme/product-floral-crystal-ring.png',
            '/theme/cat-rings.png',
          ]),
        },
        {
          colorName: 'Blush Rose Gold',
          colorCode: '#b76e79',
          quantity: 10,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-rings.png',
          ]),
        },
        {
          colorName: 'Platinum Silver',
          colorCode: '#c0c0c0',
          quantity: 6,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-rings.png',
          ]),
        },
      ],
    },
    {
      name: 'Petal Blossom Drop Earrings',
      slug: 'petal-blossom-drop-earrings',
      description: 'Delicate floral petal silhouettes dangling with genuine pearls. Available in Pure Pearl White, Velvet Ruby, and Midnight Onyx.',
      price: 1290,
      wholesaleCost: 610,
      category: 'Earrings',
      tags: 'Floral,Handmade,Gifting',
      isFeatured: true,
      commonImages: JSON.stringify([
        '/theme/cat-earrings.png',
        '/theme/cat-gifting.png',
      ]),
      images: JSON.stringify([
        '/theme/product-pearl-bloom-earrings.png',
      ]),
      variants: [
        {
          colorName: 'Pearl White',
          colorCode: '#f7f7f7',
          quantity: 20,
          images: JSON.stringify([
            '/theme/product-pearl-bloom-earrings.png',
            '/theme/cat-earrings.png',
          ]),
        },
        {
          colorName: 'Velvet Ruby Red',
          colorCode: '#9b111e',
          quantity: 14,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-earrings.png',
          ]),
        },
        {
          colorName: 'Midnight Onyx Black',
          colorCode: '#222222',
          quantity: 7,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-earrings.png',
          ]),
        },
      ],
    },
    {
      name: 'Ocean Ripple Beaded Charm Bracelet',
      slug: 'ocean-ripple-beaded-charm-bracelet',
      description: 'Stacked shimmering beads with dainty nautical charms inspired by gentle tide ripples. Perfect for stacking or wearing solo.',
      price: 890,
      wholesaleCost: 390,
      category: 'Bracelets',
      tags: 'Stackable,Summer,Ocean',
      isFeatured: false,
      commonImages: JSON.stringify([
        '/theme/cat-bracelets.png',
      ]),
      images: JSON.stringify([
        '/theme/product-sea-whisper-bracelet.png',
      ]),
      variants: [
        {
          colorName: 'Aquamarine Blue',
          colorCode: '#48d1cc',
          quantity: 25,
          images: JSON.stringify([
            '/theme/product-sea-whisper-bracelet.png',
            '/theme/cat-bracelets.png',
          ]),
        },
        {
          colorName: 'Golden Honey',
          colorCode: '#e5b80b',
          quantity: 16,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1611591475870-87ef8740c885?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-bracelets.png',
          ]),
        },
        {
          colorName: 'Lilac Amethyst',
          colorCode: '#9966cc',
          quantity: 9,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
            '/theme/cat-bracelets.png',
          ]),
        },
      ],
    },
  ];

  for (const item of multiVariantProducts) {
    const totalQty = item.variants.reduce((sum, v) => sum + v.quantity, 0);

    // Delete existing if slug exists to avoid unique collision
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      await prisma.product.delete({
        where: { id: existing.id },
      });
    }

    const created = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        wholesaleCost: item.wholesaleCost,
        category: item.category,
        tags: item.tags,
        quantity: totalQty,
        images: item.images,
        commonImages: item.commonImages,
        isFeatured: item.isFeatured,
        variants: {
          create: item.variants.map((v) => ({
            colorName: v.colorName,
            colorCode: v.colorCode,
            quantity: v.quantity,
            images: v.images,
          })),
        },
      },
      include: { variants: true },
    });

    console.log(`✓ Created Product: "${created.name}" with ${created.variants.length} color variants (Total stock: ${totalQty})`);
  }

  console.log('🎉 Successfully added color-variant products!');
}

main()
  .catch((e) => {
    console.error('Error seeding color variants:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
