import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with example data...\n');

  // Create 5 example users
  const users = [];
  const userPasswords = ['password123', 'secure456', 'mypass789', 'test1234', 'demo5678'];
  
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash(userPasswords[i - 1], 10);
    const user = await prisma.profile.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        display_name: `User ${i}`,
        password: hashedPassword,
        bio: `Hi, I'm user ${i} on BarterVerse! I love trading and making exchanges.`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i - 1],
        latitude: [40.7128, 34.0522, 41.8781, 29.7604, 33.4484][i - 1],
        longitude: [-74.0060, -118.2437, -87.6298, -95.3698, -112.0742][i - 1],
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
        coins: 1000 + i * 500,
        rating: 4.5 + (i * 0.1),
        level: 1 + i,
        xp_points: 100 * i,
      },
    });
    users.push(user);
    console.log(`✅ Created user: ${user.username} (${user.email})`);
  }

  // Create example listings
  const listings = [];
  const listingData = [
    {
      title: 'Vintage Guitar',
      description: 'A beautiful 1990s acoustic guitar in great condition',
      category: 'instruments',
      location: 'New York',
      images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300'],
      price_bc: 500,
    },
    {
      title: 'Mountain Bike',
      description: 'Never used mountain bike, comes with all accessories',
      category: 'sports',
      location: 'Los Angeles',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'],
      price_bc: 750,
    },
    {
      title: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand for desk setup',
      category: 'electronics',
      location: 'Chicago',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'],
      price_bc: 200,
    },
    {
      title: 'Coffee Maker',
      description: 'Espresso machine with milk frother, barely used',
      category: 'appliances',
      location: 'Houston',
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=300'],
      price_bc: 300,
    },
    {
      title: 'Book Collection',
      description: 'Collection of 20 sci-fi and fantasy novels',
      category: 'books',
      location: 'Phoenix',
      images: ['https://images.unsplash.com/photo-150784272343-583f20270319?w=300'],
      price_bc: 150,
    },
  ];

  for (let i = 0; i < listingData.length; i++) {
    const listing = await prisma.listing.create({
      data: {
        title: listingData[i].title,
        description: listingData[i].description,
        category: listingData[i].category,
        location: listingData[i].location,
        images: listingData[i].images,
        price_bc: listingData[i].price_bc,
        owner_id: users[i].id,
        status: 'ACTIVE',
      },
    });
    listings.push(listing);
    console.log(`✅ Created listing: "${listing.title}" (${listingData[i].price_bc} BC)`);
  }

  // Create example trades
  const trades = [];
  for (let i = 0; i < 3; i++) {
    const trade = await prisma.trade.create({
      data: {
        initiator_id: users[i].id,
        responder_id: users[i + 1].id,
        listing_id: listings[i].id,
        proposed_listing_id: listings[i + 1].id,
        coin_amount: 0,
        message: `I'd like to trade my ${listings[i].title} for your ${listings[i + 1].title}`,
        status: i === 0 ? 'PENDING' : i === 1 ? 'ACCEPTED' : 'COMPLETED',
        created_at: new Date(Date.now() - i * 86400000), // Different dates
      },
    });
    trades.push(trade);
    console.log(`✅ Created trade: ${users[i].username} ↔ ${users[i + 1].username} (${trade.status})`);
  }

  // Create example reviews
  for (let i = 0; i < 3; i++) {
    const review = await prisma.review.create({
      data: {
        author_id: users[i].id,
        target_user_id: users[i + 1].id,
        trade_id: trades[i].id,
        rating: Math.round((4 + Math.random()) * 1), // 4-5 stars
        comment: `Great ${i === 0 ? 'communication' : i === 1 ? 'product quality' : 'shipping'}!`,
      },
    });
    console.log(`✅ Created review: ${users[i].username} → ${users[i + 1].username}`);
  }

  // Create example notifications
  for (let i = 0; i < 3; i++) {
    const notification = await prisma.notification.create({
      data: {
        user_id: users[i].id,
        type: ['trade_offer', 'trade_accepted', 'review_received'][i],
        title: ['New Trade Offer', 'Trade Accepted', 'You Got a Review'][i],
        message: [
          `${users[i + 1].username} offered to trade their ${listings[i + 1].title}`,
          `${users[i + 1].username} accepted your trade offer!`,
          `${users[i + 1].username} left you a 5-star review`,
        ][i],
        related_id: trades[i].id,
        related_type: 'trade',
        is_read: i === 2, // First two unread
      },
    });
    console.log(`✅ Created notification for ${users[i].username}`);
  }

  // Create notification preferences for users
  for (const user of users) {
    await prisma.notificationPreference.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        email_enabled: true,
        email_trades: true,
        email_quests: true,
        email_messages: true,
        email_reviews: true,
        email_comments: true,
        in_app_enabled: true,
        in_app_trades: true,
        in_app_quests: true,
        in_app_messages: true,
        in_app_reviews: true,
        in_app_comments: true,
        frequency: 'immediate',
      },
    });
  }
  console.log(`✅ Created notification preferences for all users`);

  console.log('\n✨ Seeding complete!\n');
  console.log('📝 Test User Credentials:');
  for (let i = 1; i <= 5; i++) {
    console.log(`   User ${i}: user${i}@example.com / password123`);
  }
  console.log('\n📊 Database Summary:');
  console.log(`   ✓ 5 Users created`);
  console.log(`   ✓ 5 Listings created`);
  console.log(`   ✓ 3 Trades created`);
  console.log(`   ✓ 3 Reviews created`);
  console.log(`   ✓ 3 Notifications created`);
  console.log(`   ✓ 5 Notification Preferences created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
