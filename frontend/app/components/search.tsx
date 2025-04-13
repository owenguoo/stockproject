"use client";
import React from "react";
import { useState } from "react";
import axios from "axios";
import TradingViewWidget from "./tradingViewWidget";

const Search = () => {
  const [ticker, setTicker] = useState("S&P 500 Index");
  const [search, setSearch] = useState("s");
  const [price, setPrice] = useState("d");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `http://localhost:5001/stock/quote/:${ticker}`,
        {}
      );
      setPrice(res.data.c);
      setTicker(search);
      console.log("SDFasd");
    } catch (e) {
      console.log("error");
    }
  };
  // need to open websocket on call rather than .get
  return (
    <>
      <input
        type="text"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Ticker"
      />

      <button onClick={handleSubmit}>Search</button>
      <h1>{ticker}</h1>
      <h1>{price}</h1>
    </>
  );
};

export default Search;
