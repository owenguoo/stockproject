import React, { useState } from "react";
import api from "../utils/axiosConfig";
import { getToken } from "../utils/auth";

const TradePanel: React.FC<{ onTrade?: () => void }> = ({ onTrade }) => {
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [quantity, setQuantity] = useState(0);

  const fetchPrice = async () => {
    if (!symbol) return;
    try {
      const res = await api.get(`http://localhost:5001/stock/quote/${symbol}`);
      setPrice(res.data.c);
    } catch (err) {
      setStatus("Error fetching price");
    }
  };

  const getQuantityForSymbol = async (symbol: string) => {
    try {
      const res = await api.get(`/user/portfolio`);
      const transactions = res.data.transactions || [];
      const totalQty = transactions
        .filter((tx: any) => tx.stockSymbol === symbol.toUpperCase())
        .reduce((sum: number, tx: any) => sum + tx.amount, 0);
      setQuantity(totalQty);
    } catch (err) {
      setQuantity(0);
    }
  };

  const handleTrade = async (type: "buy" | "sell") => {
    if (!symbol || amount <= 0) {
      return setStatus("Invalid input");
    }
    setStatus("Fetching latest price...");
    try {
      // Always fetch latest price before trading
      const priceRes = await api.get(`http://localhost:5001/stock/quote/${symbol}`);
      const latestPrice = priceRes.data.c;
      setPrice(latestPrice);
      const res = await api.post(`/stock/${type}`, {
        stockSymbol: symbol.toUpperCase(),
        amount,
        price: latestPrice,
      });
      setStatus("Trade successful");
      if (onTrade) onTrade();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setStatus(err.response.data.error);
      } else {
        setStatus("Trade failed");
      }
    }
  };

  React.useEffect(() => {
    if (symbol) {
      getQuantityForSymbol(symbol);
    }
  }, [symbol]);

  return (
    <div className="space-y-4 p-3">
      <h2 className="text-xl font-medium">Buy / Sell Stocks</h2>
      <input
        type="text"
        placeholder="Stock Symbol (e.g., AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        className="w-full p-2 border rounded"
      />

      <button
        onClick={fetchPrice}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Get Price
      </button>

      <p className="text-sm text-gray-400 min-h-[1.5em]">
        {price != null ? `Current Price: $${price.toFixed(2)}` : "\u00A0"}
      </p>

      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full p-2 border rounded"
      />

      <p className="text-sm text-gray-400 min-h-[1.5em]">
        {price != null ? `Cost: $${(price * amount).toFixed(2)}` : "\u00A0"}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => handleTrade("buy")}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded"
        >
          Buy
        </button>
        <button
          onClick={() => handleTrade("sell")}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded"
        >
          Sell
        </button>
      </div>

      <p className="text-sm text-gray-400">{status}</p>
    </div>
  );
};

export default TradePanel;
