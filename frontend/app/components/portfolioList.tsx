import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

type AggregatedHolding = {
  symbol: string;
  quantity: number;
  avgPurchasePrice: number;
  currentPrice: number | null;
};

const LivePortfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<AggregatedHolding[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get("http://localhost:5001/user/1");
        setBalance(res.data.balance);

        const transactions = res.data.transactions;

        const grouped: Record<string, { totalQty: number; totalCost: number }> =
          {};

        transactions.forEach(({ stockSymbol, amount, price }) => {
          if (!grouped[stockSymbol]) {
            grouped[stockSymbol] = { totalQty: 0, totalCost: 0 };
          }
          grouped[stockSymbol].totalQty += amount;
          grouped[stockSymbol].totalCost += amount * price;
        });

        const aggregated: AggregatedHolding[] = Object.entries(grouped).map(
          ([symbol, { totalQty, totalCost }]) => ({
            symbol,
            quantity: totalQty,
            avgPurchasePrice: totalCost / totalQty,
            currentPrice: null,
          })
        );

        setHoldings(aggregated);

        // Subscribe to all symbols
        aggregated.forEach(({ symbol }) => {
          socket.emit("subscribe", symbol);
        });
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      }
    };

    fetchPortfolio();

    return () => {
      socket.emit("unsubscribe_all");
    };
  }, []);

  useEffect(() => {
    socket.on("stock_update", (data) => {
      setHoldings((prev) =>
        prev.map((h) => {
          const match = data.data.find((d: any) => d.s === h.symbol);
          return match ? { ...h, currentPrice: match.p } : h;
        })
      );
    });

    return () => {
      socket.off("stock_update");
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="border-b pb-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Total Balance
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          ${balance.toFixed(2)}
        </h1>
      </div>

      {holdings.map((h) => {
        const totalValue = h.currentPrice ? h.quantity * h.currentPrice : 0;
        const percentChange =
          h.currentPrice != null
            ? ((h.currentPrice - h.avgPurchasePrice) / h.avgPurchasePrice) * 100
            : null;

        const changeColor =
          percentChange === null
            ? "text-zinc-400"
            : percentChange >= 0
            ? "text-green-500"
            : "text-red-500";

        return (
          <div
            key={h.symbol}
            className="flex justify-between items-center p-3 border rounded"
          >
            <div>
              <h2 className="text-xl font-semibold">{h.symbol}</h2>
              <p className="text-sm text-zinc-600">
                Qty: {h.quantity} @ ${h.avgPurchasePrice.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                Current:{" "}
                {h.currentPrice != null
                  ? `$${h.currentPrice.toFixed(2)}`
                  : "Loading..."}
              </p>
              <p className={`text-sm font-medium ${changeColor}`}>
                {percentChange != null ? `${percentChange.toFixed(2)}%` : ""}
              </p>
              <p className="text-xs text-zinc-600">
                Total: ${totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LivePortfolio;
