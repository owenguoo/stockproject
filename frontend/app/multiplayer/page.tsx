"use client";
import React from "react";
import Layout from "@/app/components/layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Multiplayer = () => {
  const stocks = ["NVDA", "AAPL", "TSLA", "Nothing"];
  const [selectedItem, setSelectedItem] = useState("");

  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * stocks.length);
    setSelectedItem(stocks[randomIndex]);
  };
  return (
    <>
      <Layout>
        <h1>Multiplayer</h1>
        <Button onClick={handleClick}>Click for a Random Stock</Button>
        <h1>You got: {selectedItem}</h1>
      </Layout>
    </>
  );
};

export default Multiplayer;
