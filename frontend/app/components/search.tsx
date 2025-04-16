"use client";
import React from "react";
import { useState } from "react";
import axios from "axios";
import TradingViewWidget from "./tradingViewWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Search = () => {
  const [ticker, setTicker] = useState("");
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("");
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
      <Input />
      <Button onClick={handleSubmit}>Search</Button>
      <h1>{ticker}</h1>
      <h1>{price}</h1>
    </>
  );
};

export default Search;
