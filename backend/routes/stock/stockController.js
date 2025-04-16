import { PrismaClient } from "@prisma/client";
import finnhub from 'finnhub';
import verifyToken from '../../jwt.js';

export const prisma = new PrismaClient();

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINAPI; 
const finnhubClient = new finnhub.DefaultApi();

function getStockQuote(req, res) {
    const symbol = req.params.symbol.toUpperCase();
    finnhubClient.quote(symbol, (error, data) => {
        if (error) {
            return res.status(500).json({ message: 'Error fetching stock data' });
        }
        res.send(data);
    });
}

async function buyStock(req, res) {
    try {
        const userId = req.user?.userId;
        const { stockSymbol, amount, price } = req.body;
        if (!userId || !stockSymbol || !amount || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (amount <= 0 || price <= 0) {
            return res.status(400).json({ error: "Invalid amount or price" });
        }
        const cost = amount * price;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.cash < cost) {
            return res.status(400).json({ error: "Insufficient cash" });
        }
        await prisma.$transaction([
            prisma.transaction.create({
                data: { stockSymbol, amount, total: cost, userId },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    cash: { decrement: cost }
                    // Removed balance update since 'balance' column no longer exists
                },
            }),
        ]);
        return res.status(201).json({ message: "Stock purchased successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function sellStock(req, res) {
    try {
        const userId = req.user?.userId;
        const { stockSymbol, amount, price } = req.body;
        if (!userId || !stockSymbol || !amount || !price) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (amount <= 0 || price <= 0) {
            return res.status(400).json({ error: "Invalid amount or price" });
        }
        const transactions = await prisma.transaction.findMany({
            where: { userId, stockSymbol },
        });
        const totalOwned = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        if (totalOwned < amount) {
            return res.status(400).json({ error: "Not enough shares to sell" });
        }
        const sellValue = amount * price;
        // For sell, create a new transaction with negative amount and negative total
        await prisma.$transaction([
            prisma.transaction.create({
                data: { stockSymbol, amount: -amount, total: -sellValue, userId },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    cash: { increment: sellValue }
                    // Removed balance update since 'balance' column no longer exists
                },
            }),
        ]);
        return res.status(201).json({ message: "Stock sold successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getPortfolio(req, res) {
    const userId = Number(req.params.userId);
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { transactions: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Calculate balance as cash + sum of all transaction totals
        const totalStockValue = user.transactions.reduce((sum, tx) => sum + tx.total, 0);
        const balance = user.cash + totalStockValue;
        res.json({
            id: user.id,
            username: user.username,
            cash: user.cash,
            balance,
            transactions: user.transactions,
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export { getStockQuote, buyStock, sellStock, getPortfolio };
