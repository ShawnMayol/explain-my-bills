import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { UseAuth } from "../hooks/UseAuth";
import { UseBillData } from "../hooks/UseBillData";
import { UseAIAnalytics } from "../hooks/UseAIAnalytics";
import { AnalyticsHeader } from "../components/AnalyticsHeader";
import { ChartContainer } from "../components/ChartContainer";
import { AnalyticsSummary } from "../components/AnalyticsSummary";
import { AnnualExpenseCard } from "../components/AnnualExpenseCard";

const CATEGORIES = [
  { label: "Utility", value: "utility" },
  { label: "Telecom", value: "telecom" },
  { label: "Medical", value: "medical" },
  { label: "Financial", value: "financial" },
  { label: "Government", value: "government" },
  { label: "Subscription", value: "subscription" },
  { label: "Educational", value: "educational" },
  { label: "Others", value: "others" },
];

export default function AnalyticsPage() {
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const user = UseAuth();
  const {
    allBills,
    isLoading: billsLoading,
    error: billsError,
    fetchBills,
  } = UseBillData();

  const {
    summary,
    suggestion,
    isLoading: aiLoading,
    error: aiError,
    fetchAnalytics,
  } = UseAIAnalytics();

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(allBills.map((bill) => bill.year))).sort(
      (a, b) => b - a
    );
    return years;
  }, [allBills]);

  const filteredBills = useMemo(() => {
    if (!selectedYear) return [];
    return allBills.filter((bill) => bill.year === selectedYear);
  }, [allBills, selectedYear]);

  const chartData = useMemo(() => {
    if (filteredBills.length === 0) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: filteredBills.map((bill) => bill.monthLabel),
      datasets: [
        {
          label: "My Bills",
          data: filteredBills.map((bill) => bill.value),
          tooltipLabels: filteredBills.map((bill) => bill.tooltipLabel),
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(253, 224, 71)",
          pointBorderColor: "rgb(253, 224, 71)",
          pointBorderWidth: 0,
          borderColor: "rgb(253, 224, 71)",
          tension: 0.1,
        },
      ],
    };
  }, [filteredBills]);

  const annualTotal = useMemo(() => {
    return filteredBills.reduce((sum, bill) => sum + bill.value, 0);
  }, [filteredBills]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false, labels: { font: { family: "Poppins" } } },
        title: {
          display: true,
          text: `${category
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")} Bills`,
          font: { family: "Poppins" },
        },
        tooltip: {
          borderColor: "white",
          titleColor: "white",
          titleFont: { family: "Poppins" },
          bodyFont: { family: "Poppins" },
          callbacks: {
            title: (items) =>
              items[0].dataset.tooltipLabels[items[0].dataIndex],
          },
        },
      },
      layout: { padding: { left: 8 } },
      scales: {
        x: {
          ticks: {
            color: "rgb(253,224,71)",
            padding: 6,
            font: { family: "Poppins" },
          },
          grid: { color: "rgba(255,255,255,0.2)" },
        },
        y: {
          ticks: {
            color: "rgb(253,224,71)",
            padding: 7,
            font: { family: "Poppins" },
          },
          grid: { color: "rgba(255,255,255,0.2)" },
        },
      },
    }),
    [category]
  );

  const handleCategoryChange = useCallback((e) => {
    setIsTransitioning(true);
    setIsChartReady(false);
    setCategory(e.target.value);
  }, []);

  const handleYearChange = useCallback((e) => {
    setIsTransitioning(true);
    setIsChartReady(false);
    setSelectedYear(e.target.value ? +e.target.value : null);
  }, []);

  // Chart loading state - includes transition state
  const isChartLoading = billsLoading || isTransitioning || !isChartReady;
  const hasChartData = filteredBills.length > 0 && selectedYear !== null;

  // Set chart ready state when data is loaded
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsChartReady(true);
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!billsLoading && selectedYear !== null) {
      setIsChartReady(true);
    } else {
      setIsChartReady(false);
    }
  }, [billsLoading, selectedYear, isTransitioning]);

  const isLoading = billsLoading || aiLoading;
  const error = billsError || aiError;

  useEffect(() => {
    if (
      yearOptions.length > 0 &&
      (!selectedYear || !yearOptions.includes(selectedYear))
    ) {
      setSelectedYear(yearOptions[0]);
    }
  }, [yearOptions, selectedYear]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchBills(user.uid, category);
  }, [user?.uid, category, fetchBills]);

  useEffect(() => {
    if (filteredBills.length > 0) {
      fetchAnalytics(filteredBills, category, selectedYear);
    }
  }, [filteredBills, category, selectedYear, fetchAnalytics]);

  if (!user) {
    return (
      <div className="flex h-screen w-screen bg-[#1B1C21] text-white items-center justify-center">
        <p className="text-xl">Please log in to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#1B1C21] text-white">
      <Sidebar />
      <main className="ml-[20%] flex-1 flex flex-col px-14 py-10">
        <AnalyticsHeader
          category={category}
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onCategoryChange={handleCategoryChange}
          onYearChange={handleYearChange}
          isLoading={isLoading}
        />

        <ChartContainer
          chartData={chartData}
          chartOptions={chartOptions}
          isLoading={isChartLoading}
        />

        <div className="flex w-full gap-8">
          <AnalyticsSummary
            summary={summary}
            suggestion={suggestion}
            isLoading={aiLoading}
            error={error}
          />
          <AnnualExpenseCard
            annualTotal={annualTotal}
            isLoading={!isChartReady}
            hasData={true}
          />
        </div>
      </main>
    </div>
  );
}
