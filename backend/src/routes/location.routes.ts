import { Router } from 'express';
import * as locationController from '../controllers/location.controller';

const router = Router();

// Public route: Map data fetch karne ke liye
router.get('/map', locationController.getMapListings);

export default router;