import { Router } from "express";
import { authController } from "@/controllers/auth.controller";

const router = Router();

router.post("/signup", (req, res, next) => authController.signup(req, res, next));
router.post("/signin", (req, res, next) => authController.signin(req, res, next));

export default router;
