import { Router } from "express";
import { listingsController } from "../controllers/listings.controller";
import { authRequired } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", (req, res, next) => listingsController.getListings(req, res, next));
router.get("/:id", (req, res, next) => listingsController.getListingById(req, res, next));

// Protected routes
router.post("/", authRequired, (req, res, next) => listingsController.createListing(req, res, next));
router.get("/user/my-listings", authRequired, (req, res, next) => listingsController.getUserListings(req, res, next));
router.patch("/:id", authRequired, (req, res, next) => listingsController.updateListing(req, res, next));
router.delete("/:id", authRequired, (req, res, next) => listingsController.deleteListing(req, res, next));
router.post("/:id/archive", authRequired, (req, res, next) => listingsController.archiveListing(req, res, next));

export default router;
