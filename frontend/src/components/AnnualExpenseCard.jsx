import React from "react";

export const AnnualExpenseCard = ({ annualTotal, isLoading, hasData }) => {
  return (
    <div className="w-[300px] h-[100px] bg-zinc-900 border-2 border-white/20 rounded-xl flex flex-col items-center justify-center">
      <span className="font-semibold mb-1">Annual Expense</span>
      {isLoading || !hasData ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      ) : (
        <span className="font-bold text-2xl text-yellow-300">
          {annualTotal > 0
            ? annualTotal.toLocaleString("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
              })
            : "No Data"}
        </span>
      )}
    </div>
  );
};
