const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getUserPortfolio(req, res) {
  const userId = parseInt(req.params.id);

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
      balance: user.balance,
      transactions: user.transactions,
    });
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getUserPortfolio };
