const { finnhubClient } = require('../../utils/finnhub');
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();



function getStockQuote(req, res) {
    const symbols = req.params.symbol.toUpperCase();
    finnhubClient.quote(symbols, (error, data) => {
        if (error) {
            return res.status(500).json({ message: 'Error fetching stock data' });
        }
        res.send(data);
    });
}

export const buyStock = async (req, res) => {
    const { userId, stockSymbol, amount, price } = req.body;
  
    if (amount <= 0 || price <= 0) {
      return res.status(400).json({ error: "Invalid amount or price" });
    }
  
    const cost = amount * price;
  
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.cash < cost) {
      return res.status(400).json({ error: "Insufficient cash" });
    }
  
    const existing = await prisma.transaction.findFirst({
      where: { userId, stockSymbol },
    });
  
    if (existing) {
      const newAmount = existing.amount + amount;
      const newTotalCost = existing.amount * existing.price + amount * price;
      const newAvgPrice = newTotalCost / newAmount;
  
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: existing.id },
          data: {
            amount: newAmount,
            price: newAvgPrice,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            cash: { decrement: cost },
            balance: { increment: cost },
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.transaction.create({
          data: { stockSymbol, amount, price, userId },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            cash: { decrement: cost },
            balance: { increment: cost },
          },
        }),
      ]);
    }
  
    return res.status(201).json({ message: "Stock purchased successfully" });
  };
  
  
  export const sellStock = async (req, res) => {
    const { userId, stockSymbol, amount, price } = req.body;
  
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
  
    // Simplified: just log another transaction with a negative amount
    await prisma.$transaction([
      prisma.transaction.create({
        data: { stockSymbol, amount: -amount, price, userId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          cash: { increment: sellValue },
          balance: { decrement: sellValue },
        },
      }),
    ]);
  
    return res.status(201).json({ message: "Stock sold successfully" });
  };


module.exports = { getStockQuote };
