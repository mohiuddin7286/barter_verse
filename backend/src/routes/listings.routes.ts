import { Router } from "express";
import { listingsController } from "@/controllers/listings.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", (req, res, next) => listingsController.getListings(req, res, next));
router.get("/:id", (req, res, next) => listingsController.getListingById(req, res, next));

// Protected routes
router.post("/", authMiddleware, (req, res, next) => listingsController.createListing(req, res, next));
router.get("/user/my-listings", authMiddleware, (req, res, next) => listingsController.getUserListings(req, res, next));
router.patch("/:id", authMiddleware, (req, res, next) => listingsController.updateListing(req, res, next));
router.delete("/:id", authMiddleware, (req, res, next) => listingsController.deleteListing(req, res, next));
router.post("/:id/archive", authMiddleware, (req, res, next) => listingsController.archiveListing(req, res, next));

export default router;
