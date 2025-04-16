import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getUserPortfolio(req, res) {
  // Use userId from JWT
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { transactions: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      cash: user.cash,
      balance: user.balance,
      transactions: user.transactions,
    });
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { getUserPortfolio };
