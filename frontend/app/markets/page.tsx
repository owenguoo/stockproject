"use client";
import React from "react";
import Layout from "@/app/components/layout";
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
