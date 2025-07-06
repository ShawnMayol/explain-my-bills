import React from "react";
import { LineChart } from "../components/LineGraph";

export const ChartContainer = ({ chartData, chartOptions, isLoading }) => {
  return (
    <div className="w-full bg-zinc-900 border-2 border-white/20 rounded-xl mb-8 h-[320px] flex items-center justify-center">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-300"></div>
          <span>Loading chart...</span>
        </div>
      ) : chartData.labels.length === 0 ? (
        <p className="text-gray-400 text-lg">
          No data available for the selected filters
        </p>
      ) : (
        <div style={{ width: "98%", height: "98%" }}>
          <LineChart data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};
