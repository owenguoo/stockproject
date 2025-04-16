"use client";
import React from "react";
import Layout from "@/app/components/layout";
import { Wallet } from "lucide-react";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import PortfolioList from "../components/portfolioList";
import TradePanel from "../components/tradePanel";

const Portfolio = () => {
  const [balance, setBalance] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <Layout>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
                <Wallet className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
                Portfolio Performance
              </h2>

              <PortfolioList key={refreshKey} />
            </div>
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] w-full max-w-3xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
                Make Transaction
              </h2>
              <TradePanel onTrade={() => setRefreshKey((k) => k + 1)} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Portfolio;
