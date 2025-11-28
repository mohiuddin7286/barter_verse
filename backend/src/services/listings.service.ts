import { prisma } from "@/prisma/client";
import { Listing, ListingStatus } from "@prisma/client";
import { AppError } from "@/middleware/error.middleware";
import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(2000),
  category: z.string().min(1),
  image_url: z.string().url().optional(),
  is_service: z.boolean().optional().default(false),
});

export const updateListingSchema = createListingSchema.partial();

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

export class ListingsService {
  async createListing(
    ownerId: string,
    data: CreateListingInput
  ): Promise<Listing> {
    return await prisma.listing.create({
      data: {
        owner_id: ownerId,
        ...data,
      },
    });
  }

  async getListings(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string
  ): Promise<{ listings: Listing[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {
      status: ListingStatus.ACTIVE,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              rating: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.listing.count({ where }),
    ]);

    return { listings, total };
  }

  async getListingById(id: string): Promise<Listing> {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
            bio: true,
          },
        },
      },
    });

    if (!listing) {
      throw new AppError(404, "Listing not found");
    }

    return listing;
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    return await prisma.listing.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  async updateListing(
    id: string,
    userId: string,
    data: UpdateListingInput
  ): Promise<Listing> {
    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new AppError(404, "Listing not found");
    }

    if (listing.owner_id !== userId) {
      throw new AppError(403, "Unauthorized to update this listing");
    }

    return await prisma.listing.update({
      where: { id },
      data,
    });
  }

  async deleteListing(id: string, userId: string): Promise<void> {
    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new AppError(404, "Listing not found");
    }

    if (listing.owner_id !== userId) {
      throw new AppError(403, "Unauthorized to delete this listing");
    }

    await prisma.listing.delete({
      where: { id },
    });
  }

  async archiveListing(id: string, userId: string): Promise<Listing> {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new AppError(404, "Listing not found");
    }

    if (listing.owner_id !== userId) {
      throw new AppError(403, "Unauthorized to archive this listing");
    }

    return await prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ARCHIVED },
    });
  }
}
