import express from 'express';
import { getStockQuote, buyStock, sellStock, getPortfolio } from './stockController.js';
import verifyToken from '../../jwt.js';

const router = express.Router();

router.get('/quote/:symbol', getStockQuote);
router.post('/buy', verifyToken, buyStock);
router.post('/sell', verifyToken, sellStock);
router.get('/portfolio/:userId', getPortfolio);

export default router;
