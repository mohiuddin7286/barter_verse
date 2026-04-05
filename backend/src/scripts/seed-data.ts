import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with example data...\n');

  // Create example users, including Indian localities for the map experience
  const users = [];
  const userSeeds = [
    {
      email: 'user1@example.com',
      username: 'user1',
      display_name: 'User 1',
      password: 'password123',
      city: 'Hyderabad',
      latitude: 17.3850,
      longitude: 78.4867,
    },
    {
      email: 'user2@example.com',
      username: 'user2',
      display_name: 'User 2',
      password: 'password123',
      city: 'Prayagraj',
      latitude: 25.4358,
      longitude: 81.8463,
    },
    {
      email: 'user3@example.com',
      username: 'user3',
      display_name: 'User 3',
      password: 'password123',
      city: 'Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
    },
    {
      email: 'user4@example.com',
      username: 'user4',
      display_name: 'User 4',
      password: 'password123',
      city: 'Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    {
      email: 'user5@example.com',
      username: 'user5',
      display_name: 'User 5',
      password: 'password123',
      city: 'Kolkata',
      latitude: 22.5726,
      longitude: 88.3639,
    },
  ];

  for (const [index, userSeed] of userSeeds.entries()) {
    const hashedPassword = await bcrypt.hash(userSeed.password, 10);
    const user = await prisma.profile.upsert({
      where: { email: userSeed.email },
      update: {
        username: userSeed.username,
        display_name: userSeed.display_name,
        password: hashedPassword,
        bio: `Hi, I'm ${userSeed.display_name} on BarterVerse! I love trading and making exchanges.`,
        city: userSeed.city,
        latitude: userSeed.latitude,
        longitude: userSeed.longitude,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userSeed.username}`,
        coins: 1000 + index * 500,
        rating: 4.5 + ((index + 1) * 0.1),
        level: 1 + (index + 1),
        xp_points: 100 * (index + 1),
      },
      create: {
        email: userSeed.email,
        username: userSeed.username,
        display_name: userSeed.display_name,
        password: hashedPassword,
        bio: `Hi, I'm ${userSeed.display_name} on BarterVerse! I love trading and making exchanges.`,
        city: userSeed.city,
        latitude: userSeed.latitude,
        longitude: userSeed.longitude,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userSeed.username}`,
        coins: 1000 + index * 500,
        rating: 4.5 + ((index + 1) * 0.1),
        level: 1 + (index + 1),
        xp_points: 100 * (index + 1),
      },
    });
    users.push(user);
    console.log(`✅ Created user: ${user.username} (${user.email})`);
  }

  const seededUserIds = users.map((user) => user.id);

  // Reset seeded marketplace data so reruns don't keep stale locality records.
  await prisma.notification.deleteMany({
    where: { user_id: { in: seededUserIds } },
  });

  await prisma.review.deleteMany({
    where: {
      OR: [
        { author_id: { in: seededUserIds } },
        { target_user_id: { in: seededUserIds } },
      ],
    },
  });

  await prisma.trade.deleteMany({
    where: {
      OR: [
        { initiator_id: { in: seededUserIds } },
        { responder_id: { in: seededUserIds } },
      ],
    },
  });

  await prisma.listing.deleteMany({
    where: { owner_id: { in: seededUserIds } },
  });

  // Create example listings
  const listings = [];
  const listingData = [
    {
      title: 'Hyderabad Web Design Sprint',
      description: '3-hour website redesign session for startups and local businesses in Hyderabad.',
      category: 'Skills',
      location: 'Hyderabad, Banjara Hills',
      images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300'],
      price_bc: 500,
    },
    {
      title: 'Prayagraj Handmade Bookshelf',
      description: 'Solid wood bookshelf made by a local carpenter in Prayagraj.',
      category: 'Items',
      location: 'Prayagraj, Civil Lines',
      images: ['https://images.unsplash.com/photo-1595428774223-ef52624120e9?w=300'],
      price_bc: 750,
    },
    {
      title: 'Mumbai Laptop Stand',
      description: 'Adjustable aluminum laptop stand for desk setup',
      category: 'Items',
      location: 'Mumbai, Andheri West',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'],
      price_bc: 200,
    },
    {
      title: 'Bengaluru Coffee Maker',
      description: 'Espresso machine with milk frother, barely used',
      category: 'Items',
      location: 'Bengaluru, Indiranagar',
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=300'],
      price_bc: 300,
    },
    {
      title: 'Kolkata Book Collection',
      description: 'Collection of 20 sci-fi and fantasy novels',
      category: 'Items',
      location: 'Kolkata, Salt Lake',
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

  // Create example quests
  const questSeeds = [
    {
      title: 'Post Your First Item',
      description: 'Create and publish one listing to the marketplace.',
      category: 'Daily',
      type: 'Post',
      xp_reward: 50,
      coin_reward: 10,
      progress_target: 1,
      icon: 'package',
      season: 'Season 1',
    },
    {
      title: 'Complete 3 Trades',
      description: 'Finish three successful trades with other members.',
      category: 'Weekly',
      type: 'Trade',
      xp_reward: 200,
      coin_reward: 50,
      progress_target: 3,
      icon: 'repeat',
      season: 'Season 1',
    },
    {
      title: 'Join a Skill Share Session',
      description: 'Attend or host a skill share session this season.',
      category: 'Seasonal',
      type: 'Session',
      xp_reward: 350,
      coin_reward: 75,
      progress_target: 1,
      icon: 'sparkles',
      season: 'Season 1',
    },
  ];

  const quests = [];
  for (const questSeed of questSeeds) {
    const existingQuest = await prisma.quest.findFirst({
      where: { title: questSeed.title },
    });

    const quest = existingQuest ?? await prisma.quest.create({
      data: {
        title: questSeed.title,
        description: questSeed.description,
        category: questSeed.category,
        type: questSeed.type,
        xp_reward: questSeed.xp_reward,
        coin_reward: questSeed.coin_reward,
        progress_target: questSeed.progress_target,
        icon: questSeed.icon,
        season: questSeed.season,
        is_active: true,
      },
    });

    quests.push(quest);
    console.log(`✅ Created quest: ${quest.title}`);
  }

  // Give the first user a completed quest and progress on another
  await prisma.questCompletion.upsert({
    where: {
      quest_id_user_id: {
        quest_id: quests[0].id,
        user_id: users[0].id,
      },
    },
    update: {
      progress: quests[0].progress_target,
      completed: true,
      completed_at: new Date(),
    },
    create: {
      quest_id: quests[0].id,
      user_id: users[0].id,
      progress: quests[0].progress_target,
      completed: true,
      completed_at: new Date(),
    },
  });

  await prisma.questCompletion.upsert({
    where: {
      quest_id_user_id: {
        quest_id: quests[1].id,
        user_id: users[0].id,
      },
    },
    update: {
      progress: 2,
      completed: false,
      completed_at: null,
    },
    create: {
      quest_id: quests[1].id,
      user_id: users[0].id,
      progress: 2,
      completed: false,
    },
  });

  const starterAchievement = await prisma.achievement.findFirst({
    where: {
      user_id: users[0].id,
      title: 'First Quest',
    },
  });

  if (!starterAchievement) {
    await prisma.achievement.create({
      data: {
        user_id: users[0].id,
        title: 'First Quest',
        description: 'Complete your first quest.',
        icon: 'trophy',
        badge_color: 'bronze',
      },
    });
  }
  console.log(`✅ Seeded quests, progress, and a starter achievement`);

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
  console.log(`   ✓ 3 Quests created`);
  console.log(`   ✓ Quest progress seeded`);
  console.log(`   ✓ 1 Achievement created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
