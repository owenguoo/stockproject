import express from 'express';
import { registerUser, loginUser } from './authController.js';

const router = express.Router();

// Route definitions
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
