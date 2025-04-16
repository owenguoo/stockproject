import React, { useState } from "react";
import axios from "axios";

const TradePanel: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");

  const fetchPrice = async () => {
    if (!symbol) return;
    try {
      const res = await axios.get(
        `http://localhost:5001/stock/quote/:${symbol}`
      );
      setPrice(res.data.c);
      setStatus(`Current price: $${res.data.c}`);
    } catch (err) {
      setStatus("Error fetching price");
    }
  };

  const handleTrade = async (type: "buy" | "sell") => {
    if (!symbol || !price || amount <= 0) {
      return setStatus("Invalid input");
    }

    try {
      const res = await axios.post(`/api/${type}`, {
        userId: 1,
        stockSymbol: symbol.toUpperCase(),
        amount,
        price,
      });
      setStatus(res.data.message);
    } catch (err) {
      setStatus("Trade failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-xl shadow space-y-4">
      <h2 className="text-xl font-medium">Buy / Sell Stocks</h2>
      <input
        type="text"
        placeholder="Stock Symbol (e.g., AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        onClick={fetchPrice}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Get Price
      </button>

      {price && (
        <p className="text-sm text-gray-700">
          Current Price: ${price.toFixed(2)}
        </p>
      )}

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full p-2 border rounded"
      />

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

      <p className="text-sm text-gray-600">{status}</p>
    </div>
  );
};

export default TradePanel;
