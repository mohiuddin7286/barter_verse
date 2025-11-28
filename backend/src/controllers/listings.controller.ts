import { Request, Response, NextFunction } from "express";
import {
  ListingsService,
  createListingSchema,
  updateListingSchema,
} from "@/services/listings.service";
import { AppError } from "@/middleware/error.middleware";
import { ApiResponse } from "@/types/index";

const listingsService = new ListingsService();

export class ListingsController {
  async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const validatedData = createListingSchema.parse(req.body);
      const listing = await listingsService.createListing(userId, validatedData);

      res.status(201).json({
        success: true,
        data: listing,
        message: "Listing created successfully",
      } as ApiResponse<typeof listing>);
    } catch (error) {
      next(error);
    }
  }

  async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const { listings, total } = await listingsService.getListings(
        page,
        limit,
        category,
        search
      );

      res.status(200).json({
        success: true,
        data: {
          listings,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const listing = await listingsService.getListingById(id);

      res.status(200).json({
        success: true,
        data: listing,
      } as ApiResponse<typeof listing>);
    } catch (error) {
      next(error);
    }
  }

  async getUserListings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const listings = await listingsService.getUserListings(userId);

      res.status(200).json({
        success: true,
        data: listings,
      } as ApiResponse<typeof listings>);
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const { id } = req.params;
      const validatedData = updateListingSchema.parse(req.body);
      const listing = await listingsService.updateListing(id, userId, validatedData);

      res.status(200).json({
        success: true,
        data: listing,
        message: "Listing updated successfully",
      } as ApiResponse<typeof listing>);
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const { id } = req.params;
      await listingsService.deleteListing(id, userId);

      res.status(200).json({
        success: true,
        message: "Listing deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const { id } = req.params;
      const listing = await listingsService.archiveListing(id, userId);

      res.status(200).json({
        success: true,
        data: listing,
        message: "Listing archived successfully",
      } as ApiResponse<typeof listing>);
    } catch (error) {
      next(error);
    }
  }
}

export const listingsController = new ListingsController();
