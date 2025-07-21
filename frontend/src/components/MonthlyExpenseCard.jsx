// components/MonthlyExpenseCard.jsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react"; // Assuming you have lucide-react or similar icons

export const MonthlyExpenseCard = ({
  monthlyTotal,
  percentageChange,
  isLoading,
  hasData,
}) => {
  const isIncreased = percentageChange > 0;
  const isDecreased = percentageChange < 0;
  const isNoChange = percentageChange === 0 || isNaN(percentageChange); // isNaN for 0/0 case

  const formattedChange =
    percentageChange === Infinity
      ? "from zero"
      : `${Math.abs(percentageChange).toFixed(1)}%`;

  return (
    <div className="w-full md:w-[300px] h-[100px] bg-zinc-900 border-2 border-white/20 rounded-xl flex flex-col items-center justify-center p-4">
      <span className="font-semibold mb-1 text-white text-lg">
        This Month's Expense
      </span>
      {isLoading || !hasData ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      ) : (
        <>
          <span className="font-bold text-2xl text-yellow-300">
            {/* CORRECTED LINE: Use monthlyTotal here */}
            {monthlyTotal > 0
              ? monthlyTotal.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
                  minimumFractionDigits: 2,
                })
              : "No Data"}
          </span>
          {/* CORRECTED LINE: Only show comparison if there's monthlyTotal data */}
          {monthlyTotal > 0 && (
            <div className="flex items-center text-sm mt-1">
              {isIncreased && percentageChange !== Infinity && (
                <ArrowUp className="w-4 h-4 text-red-500 mr-1" />
              )}
              {isDecreased && (
                <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
              )}
              <span
                className={`font-medium ${
                  isIncreased && percentageChange !== Infinity
                    ? "text-red-500"
                    : isDecreased
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {isIncreased &&
                  percentageChange !== Infinity &&
                  `Up ${formattedChange}`}
                {isDecreased && `Down ${formattedChange}`}
                {isNoChange && `No Change`}
                {percentageChange === Infinity &&
                  `Significantly Up ${formattedChange}`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
