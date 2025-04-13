"use client";
import React from "react";
import Layout from "@/components/kokonutui/layout";
import TradingViewWidget from "../components/tradingViewWidget";

const Markets = () => {
  return (
    <>
      <Layout>
        <h1>Market</h1>
        <TradingViewWidget />
      </Layout>
    </>
  );
};

export default Markets;
