import express from "express";
import { getUserPortfolio } from "./userController.js";
import verifyToken from '../../jwt.js';

const router = express.Router();

router.get("/portfolio", verifyToken, getUserPortfolio);

export default router;
