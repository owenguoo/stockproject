import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";

const FINNHUB_TOKEN = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
const finnhubSocket =
  typeof window !== "undefined"
    ? new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`)
    : null;

type AggregatedHolding = {
  symbol: string;
  quantity: number;
  avgPurchasePrice: number;
  currentPrice: number | null;
};

const LivePortfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<AggregatedHolding[]>([]);
  const [cash, setCash] = useState(0);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);

  const subscribeToSymbols = (symbols: string[]) => {
    if (!finnhubSocket) return;

    if (finnhubSocket.readyState !== 1) {
      finnhubSocket.addEventListener(
        "open",
        () => {
          console.log("Finnhub WebSocket OPENED");
          subscribedSymbols.forEach((symbol) => {
            console.log("Unsubscribing from", symbol);
            finnhubSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
          });
          symbols.forEach((symbol) => {
            console.log("Subscribing to", symbol);
            finnhubSocket.send(JSON.stringify({ type: "subscribe", symbol }));
          });
          setSubscribedSymbols(symbols);
        },
        { once: true }
      );
      return;
    }

    subscribedSymbols.forEach((symbol) => {
      console.log("Unsubscribing from", symbol);
      finnhubSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
    });
    symbols.forEach((symbol) => {
      console.log("Subscribing to", symbol);
      finnhubSocket.send(JSON.stringify({ type: "subscribe", symbol }));
    });
    setSubscribedSymbols(symbols);
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get("/user/portfolio");
        const transactions = res.data.transactions;
        setCash(Number(res.data.cash) || 0);
        const grouped: Record<string, { totalQty: number; totalCost: number }> =
          {};
        transactions.forEach(
          ({
            stockSymbol,
            amount,
            total,
          }: {
            stockSymbol: string;
            amount: number;
            total: number;
          }) => {
            if (!grouped[stockSymbol]) {
              grouped[stockSymbol] = { totalQty: 0, totalCost: 0 };
            }
            if (amount > 0) {
              grouped[stockSymbol].totalQty += amount;
              grouped[stockSymbol].totalCost += total;
            } else if (amount < 0) {
              const holding = grouped[stockSymbol];
              const qtyToRemove = Math.abs(amount);
              if (holding.totalQty > 0) {
                const costPerShare = holding.totalCost / holding.totalQty;
                holding.totalCost -= costPerShare * qtyToRemove;
                holding.totalQty += amount;
              }
            }
          }
        );
        const aggregated: AggregatedHolding[] = Object.entries(grouped)
          .filter(([_, { totalQty }]) => totalQty !== 0)
          .map(([symbol, { totalQty, totalCost }]) => ({
            symbol,
            quantity: totalQty,
            avgPurchasePrice: totalQty !== 0 ? totalCost / totalQty : 0,
            currentPrice: null,
          }));
        setHoldings(aggregated);
        subscribeToSymbols(aggregated.map((h) => h.symbol));
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      }
    };
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (!finnhubSocket) return;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "trade" && data.data) {
        setHoldings((prev) =>
          prev.map((h) => {
            const trade = data.data.find((d: any) => d.s === h.symbol);
            return trade ? { ...h, currentPrice: trade.p } : h;
          })
        );
      }
    };
    finnhubSocket.addEventListener("message", handleMessage);
    return () => {
      finnhubSocket.removeEventListener("message", handleMessage);
    };
  }, []);

  const portfolioValue = holdings.reduce((acc, h) => {
    return h.currentPrice != null ? acc + h.currentPrice * h.quantity : acc;
  }, 0);
  const totalBalance = (Number(cash) || 0) + (Number(portfolioValue) || 0);

  return (
    <div className="p-4 space-y-4">
      <div className="border-b pb-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Total Balance
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          ${isNaN(totalBalance) ? "0.00" : totalBalance.toFixed(2)}
        </h1>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {holdings.map((h) => {
          const costBasis = h.quantity * h.avgPurchasePrice;
          const marketValue = h.quantity * (h.currentPrice ?? 0);
          const percentChange =
            costBasis > 0
              ? ((marketValue - costBasis) / costBasis) * 100
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
              className="flex justify-between items-center p-3 border rounded  hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            >
              <div>
                <h2 className="text-xl font-semibold">{h.symbol}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {h.quantity} shares
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {h.currentPrice != null
                    ? `$${h.currentPrice.toFixed(2)}`
                    : "Loading..."}
                </p>
                <p className={`text-xs font-medium ${changeColor}`}>
                  {percentChange != null ? `${percentChange.toFixed(2)}%` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LivePortfolio;
