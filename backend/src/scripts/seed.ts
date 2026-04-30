import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create Dummy Users
    const user1 = await prisma.profile.upsert({
      where: { email: 'alex@example.com' },
      update: {},
      create: {
        email: 'alex@example.com',
        username: 'Alex_Trader',
        password: 'password123',
        coins: 500,
      },
    });

    const user2 = await prisma.profile.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        username: 'Sarah_Skills',
        password: 'password123',
        coins: 300,
      },
    });

    console.log('✅ Users created!');

    // 2. Create Dummy Listings
    await prisma.listing.createMany({
      skipDuplicates: true,
      data: [
        {
          title: 'Vintage Film Camera',
          description: 'Fully functional Canon AE-1 with 50mm lens. Great for photography beginners.',
          category: 'Electronics',
          price_bc: 150,
          location: 'Downtown Hub',
          owner_id: user1.id,
          status: 'ACTIVE',
          images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'],
        },
        {
          title: 'Python Tutoring (2 Hours)',
          description: 'I will teach you the basics of Python programming, loops, and data structures.',
          category: 'Skills',
          price_bc: 80,
          location: 'Remote',
          owner_id: user2.id,
          status: 'ACTIVE',
          images: ['https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000&auto=format&fit=crop'],
        },
        {
          title: 'Acoustic Guitar',
          description: 'Yamaha acoustic guitar in good condition. Barely used.',
          category: 'Items',
          price_bc: 200,
          location: 'Campus North',
          owner_id: user1.id,
          status: 'ACTIVE',
          images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1000&auto=format&fit=crop'],
        }
      ]
    });

    console.log('✅ Listings created!');
    console.log('🎉 Seeding completed successfully! You can now check the Explore page.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
