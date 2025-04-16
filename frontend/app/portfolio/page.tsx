"use client";
import React from "react";
import Layout from "@/components/kokonutui/layout";
import { Button } from "@/components/ui/button";
import Search from "../components/search";
import { Wallet } from "lucide-react";
import { CreditCard } from "lucide-react";
import { Calendar } from "lucide-react";
import List01 from "@/components/kokonutui/list-01";
import List02 from "@/components/kokonutui/list-02";
import List03 from "@/components/kokonutui/list-03";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import PortfolioList from "../components/portfolioList";

const Portfolio = () => {
  const [balance, setBalance] = useState("");
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

              <PortfolioList />
            </div>
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
                Make Transaction
              </h2>
              <div className="w-full max-w-xl mx-auto bg-white dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm backdrop-blur-xl">
                <div className="flex-1">
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-m font-medium text-zinc-600 dark:text-zinc-400">
                      Search Ticker
                    </p>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    <Button className="text-xs font-medium">Buy</Button>
                    <Button className="text-xs font-medium">Sell</Button>
                  </div>
                  <h2>Quantity</h2>
                  <Input />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Portfolio;
