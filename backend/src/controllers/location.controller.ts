import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

const fallbackMapListings = [
  {
    id: 'demo-hyderabad-web-design',
    title: 'Hyderabad Web Design Sprint',
    category: 'Skills',
    price_bc: 500,
    images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300'],
    location: 'Hyderabad, Banjara Hills',
    owner: {
      id: 'demo-hyd-user',
      username: 'hyderabad_creator',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hyderabad_creator',
      latitude: 17.385,
      longitude: 78.4867,
      city: 'Hyderabad',
    },
  },
  {
    id: 'demo-prayagraj-bookshelf',
    title: 'Prayagraj Handmade Bookshelf',
    category: 'Items',
    price_bc: 750,
    images: ['https://images.unsplash.com/photo-1595428774223-ef52624120e9?w=300'],
    location: 'Prayagraj, Civil Lines',
    owner: {
      id: 'demo-prayagraj-user',
      username: 'prayagraj_maker',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prayagraj_maker',
      latitude: 25.4358,
      longitude: 81.8463,
      city: 'Prayagraj',
    },
  },
];

export const getMapListings = async (req: Request, res: Response) => {
  try {
    // Sirf ACTIVE listings lao jinke owner ki location maujood hai
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        owner: {
          latitude: { not: null },
          longitude: { not: null }
        }
      },
      select: {
        id: true,
        title: true,
        category: true,
        price_bc: true,
        images: true,
        location: true,
        owner: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            latitude: true,
            longitude: true,
            city: true
          }
        }
      }
    });

    const hasHyderabad = listings.some((listing) => listing.owner?.city?.toLowerCase() === 'hyderabad');
    const hasPrayagraj = listings.some((listing) => listing.owner?.city?.toLowerCase() === 'prayagraj');

    const data = [
      ...listings,
      ...(hasHyderabad ? [] : [fallbackMapListings[0]]),
      ...(hasPrayagraj ? [] : [fallbackMapListings[1]]),
    ];

    res.json({ success: true, data });
  } catch (error) {
    console.error("Map fetch error:", error);
    res.status(500).json({ success: false, data: fallbackMapListings, message: "Failed to load map data" });
  }
};