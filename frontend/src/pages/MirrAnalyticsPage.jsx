/**
 * 
 * This is the testing page of Analytics Page where the new changes will be implemented
 * - Nash
 * 
 */


import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { UseAuth } from "../hooks/UseAuth";
import { UseBillData } from "../hooks/UseBillData";
import { UseAIAnalytics } from "../hooks/UseAIAnalytics";
import { MirrAnalyticsHeader } from "../components/MirrAnalyticsHeader";
import { ChartContainer } from "../components/ChartContainer";
import { MirrAnalyticsSummary } from "../components/MirrAnalyticsSummary";
import { AnnualExpenseCard } from "../components/AnnualExpenseCard";
import { HiOutlineMenu } from "react-icons/hi";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleCategoryChange = useCallback(
    (e) => {
      const newCategory = e.target.value;

      setIsTransitioning(true);
      setIsChartReady(false);
      setCategory(newCategory);

      if (user?.uid) {
        fetchBills(user.uid, newCategory);
      }
    },
    [user?.uid, fetchBills]
  );

  const handleYearChange = useCallback((e) => {
    setIsTransitioning(true);
    setIsChartReady(false);
    setSelectedYear(e.target.value ? +e.target.value : null);
  }, []);

  const isChartLoading = billsLoading || isTransitioning || !isChartReady;
  const hasChartData = filteredBills.length > 0 && selectedYear !== null;

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
    if (!billsLoading && selectedYear !== null) {
      const filteredBills = allBills.filter(
        (bill) => bill.year === selectedYear
      );

      fetchAnalytics(filteredBills, category, selectedYear, user.uid);
    }
  }, [billsLoading, allBills, selectedYear, category, fetchAnalytics]);

  if (!user) {
    return (
      <div className="flex h-screen w-screen bg-[#1B1C21] text-white items-center justify-center">
        <p className="text-xl">Please log in to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">

        {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
      <div
        className={`fixed top-0 left-0 right-0 z-30 md:hidden flex items-center h-12 px-4 py-7 transition-colors duration-300 bg-[#1B1C21]`}
      >
        <button
          className="text-yellow-300 hover:text-white cursor-pointer ps-5"
          onClick={() => setSidebarOpen(true)}
        >
          <HiOutlineMenu className="w-7 h-7" />
        </button>
      </div>

        {/* Main Analytics */}
      <main className="w-full md:ml-[20%] flex-1 flex flex-col px-4 md:px-14 py-10 mt-8 md:mt-0 overflow-y-auto">
        <h1 className="text-2xl text-red-600 font-bold text-center">THIS IS THE MIRROR PAGE OF ANALYTICS</h1>
    
        <MirrAnalyticsHeader
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

        {/* AI Analytics Summary */}
        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8">
          <MirrAnalyticsSummary
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
