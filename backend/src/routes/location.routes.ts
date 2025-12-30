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
    const { latitude, longitude, city, country, method } = req.body;

    let finalLat = latitude;
    let finalLon = longitude;

    // If city/country provided, geocode them
    if (city && country && (!latitude || !longitude)) {
      const coords = await geocodeLocation(city, country);
      if (coords) {
        finalLat = coords.latitude;
        finalLon = coords.longitude;
      }
    }

    // Validate coordinates
    if (!isValidCoordinate(finalLat, finalLon)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180',
      });
    }

    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: {
        latitude: finalLat,
        longitude: finalLon,
        city: city || null,
        country: country || null,
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
        country: updatedUser.country,
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

    if (!currentUser || !currentUser.latitude || !currentUser.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Your location is not set. Please update your location first.',
      });
    }

    // Find all users with location
    let users = await prisma.profile.findMany({
      where: {
        id: { not: userId },
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        listings: {
          where: category ? { category } : undefined,
          take: 5,
        },
      },
    });

    // Calculate distances and filter
    const nearbyUsers = users
      .map(user => ({
        ...user,
        distance: calculateDistance(
          currentUser.latitude!,
          currentUser.longitude!,
          user.latitude!,
          user.longitude!
        ),
      }))
      .filter(user => user.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    res.json({
      success: true,
      data: nearbyUsers.map(user => ({
        id: user.id,
        username: user.username,
        rating: user.rating,
        avatar_url: user.avatar_url,
        distance: parseFloat(user.distance.toFixed(2)),
        city: user.city,
        country: user.country,
        listings: user.listings,
      })),
      total: nearbyUsers.length,
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
    const radiusKm = parseInt(req.query.radius) || 50;
    const category = req.query.category;

    // Get current user's location
    const currentUser = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!currentUser || !currentUser.latitude || !currentUser.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Your location is not set. Please update your location first.',
      });
    }

    // Find all listings with owner location
    const listings = await prisma.listing.findMany({
      where: {
        owner_id: { not: userId },
        status: 'ACTIVE',
        category: category ? category : undefined,
      },
      include: {
        owner: true,
      },
    });

    // Filter by distance
    const nearbyListings = listings
      .filter(listing => listing.owner.latitude && listing.owner.longitude)
      .map(listing => ({
        ...listing,
        distance: calculateDistance(
          currentUser.latitude!,
          currentUser.longitude!,
          listing.owner.latitude!,
          listing.owner.longitude!
        ),
      }))
      .filter(listing => listing.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    res.json({
      success: true,
      data: nearbyListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        image_url: listing.image_url,
        is_service: listing.is_service,
        distance: parseFloat(listing.distance.toFixed(2)),
        owner: {
          id: listing.owner.id,
          username: listing.owner.username,
          rating: listing.owner.rating,
          avatar_url: listing.owner.avatar_url,
          city: listing.owner.city,
          country: listing.owner.country,
        },
      })),
      total: nearbyListings.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
