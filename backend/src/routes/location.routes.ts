import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware';
import { calculateDistance, findNearbyLocations, isValidCoordinate, geocodeLocation } from '../utils/location';

const router = Router();
const prisma = new PrismaClient();

// Update user location
router.put('/update-location', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, city, town, state, country, pincode } = req.body;

    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: {
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        city: city || undefined,
        town: town || undefined,
        state: state || undefined,
        country: country || undefined,
        pincode: pincode || undefined,
      },
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        id: updatedUser.id,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        city: updatedUser.city,
        town: updatedUser.town,
        state: updatedUser.state,
        country: updatedUser.country,
        pincode: updatedUser.pincode,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Find nearby traders (for skill sharing/trading)
router.get('/nearby-traders', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const radiusKm = parseInt(req.query.radius) || 50;
    const category = req.query.category;

    // Get current user's location
    const currentUser = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Please set your location first.',
      });
    }

    // Filter by location details (city, state, country, pincode)
    let whereClause: any = {
      id: { not: userId },
    };

    // Match by pincode if available
    if (currentUser.pincode) {
      whereClause.pincode = currentUser.pincode;
    } 
    // Otherwise match by state and country
    else if (currentUser.state && currentUser.country) {
      whereClause.state = currentUser.state;
      whereClause.country = currentUser.country;
    }
    // Fall back to country and city
    else if (currentUser.country && currentUser.city) {
      whereClause.country = currentUser.country;
      whereClause.city = currentUser.city;
    }
    // Minimum: match by country
    else if (currentUser.country) {
      whereClause.country = currentUser.country;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please set your location (country/city/pincode) first.',
      });
    }

    // Find nearby users
    let users = await prisma.profile.findMany({
      where: whereClause,
      include: {
        listings: {
          where: category ? { category } : undefined,
          take: 5,
        },
      },
      take: 20,
    });

    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        username: user.username,
        rating: user.rating,
        avatar_url: user.avatar_url,
        city: user.city,
        town: user.town,
        state: user.state,
        country: user.country,
        pincode: user.pincode,
        listings: user.listings,
      })),
      total: users.length,
      matchType: currentUser.pincode ? 'pincode' : 'location',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Find nearby listings
router.get('/nearby-listings', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const category = req.query.category;

    // Get current user's location
    const currentUser = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Please set your location first.',
      });
    }

    // Build location filter for listings owners
    let ownerWhereClause: any = {};

    // Match by pincode if available
    if (currentUser.pincode) {
      ownerWhereClause.pincode = currentUser.pincode;
    } 
    // Otherwise match by state and country
    else if (currentUser.state && currentUser.country) {
      ownerWhereClause.state = currentUser.state;
      ownerWhereClause.country = currentUser.country;
    }
    // Fall back to country and city
    else if (currentUser.country && currentUser.city) {
      ownerWhereClause.country = currentUser.country;
      ownerWhereClause.city = currentUser.city;
    }
    // Minimum: match by country
    else if (currentUser.country) {
      ownerWhereClause.country = currentUser.country;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please set your location (country/city/pincode) first.',
      });
    }

    // Find nearby listings
    const listings = await prisma.listing.findMany({
      where: {
        owner_id: { not: userId },
        status: 'ACTIVE',
        category: category ? category : undefined,
        owner: ownerWhereClause,
      },
      include: {
        owner: true,
      },
      take: 20,
    });

    res.json({
      success: true,
      data: listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        image_url: listing.image_url,
        is_service: listing.is_service,
        owner: {
          id: listing.owner.id,
          username: listing.owner.username,
          rating: listing.owner.rating,
          avatar_url: listing.owner.avatar_url,
          city: listing.owner.city,
          town: listing.owner.town,
          state: listing.owner.state,
          country: listing.owner.country,
          pincode: listing.owner.pincode,
        },
      })),
      total: listings.length,
      matchType: currentUser.pincode ? 'pincode' : 'location',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
