import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

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

    res.json({ success: true, data: listings });
  } catch (error) {
    console.error("Map fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to load map data" });
  }
};