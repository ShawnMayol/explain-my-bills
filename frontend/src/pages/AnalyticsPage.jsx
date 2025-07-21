import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { UseAuth } from "../hooks/UseAuth";
import { UseBillData } from "../hooks/UseBillData";
import { UseAIAnalytics } from "../hooks/UseAIAnalytics";
import { AnalyticsHeader } from "../components/AnalyticsHeader";
import { ChartContainer } from "../components/ChartContainer";
import { AnalyticsSummary } from "../components/AnalyticsSummary";
import { MonthlyExpenseCard } from "../components/MonthlyExpenseCard"; // Corrected import
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
  const [isChartReady, setIsChartReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // NEW STATE: This state will control when to actually trigger the AI analytics fetch
  // It starts as false, and AnalyticsSummary will tell it when to become true.
  const [triggerAIAnalyticsFetch, setTriggerAIAnalyticsFetch] = useState(false);

  const user = UseAuth();
  const {
    allBills,
    isLoading: billsLoading,
    error: billsError,
    fetchBills,
  } = UseBillData();

  // UseAIAnalytics hook call.
  // We will now pass relevant filtering data directly to the hook from AnalyticsPage.
  // The hook itself will manage its internal state and caching based on these props.
  const {
    summary,
    suggestion,
    isLoading: aiLoading,
    error: aiError,
    fetchAnalytics, // This is the function we need to call
  } = UseAIAnalytics(); // No longer passing data as props here, but in the useEffect

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(allBills.map((bill) => bill.year))).sort(
      (a, b) => b - a
    );
    return years;
  }, [allBills]);

  const filteredBills = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // Set to the last day of the selected end month
    end.setHours(23, 59, 59, 999); // Set to end of day for inclusive range

    return allBills.filter((bill) => {
      const billDate = new Date(bill.date); // Ensure bill.date is a Date object
      return billDate >= start && billDate <= end;
    });
  }, [allBills, startDate, endDate]);

  const currentMonthTotal = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const targetMonth = endDate.getMonth();
    const targetYear = endDate.getFullYear();

    return allBills.reduce((sum, bill) => {
      const billDate = new Date(bill.date);
      if (
        billDate.getMonth() === targetMonth &&
        billDate.getFullYear() === targetYear
      ) {
        return sum + bill.value;
      }
      return sum;
    }, 0);
  }, [allBills, startDate, endDate]);

  const previousMonthTotal = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const previousMonthDate = new Date(endDate);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    const targetMonth = previousMonthDate.getMonth();
    const targetYear = previousMonthDate.getFullYear();

    return allBills.reduce((sum, bill) => {
      const billDate = new Date(bill.date);
      if (
        billDate.getMonth() === targetMonth &&
        billDate.getFullYear() === targetYear
      ) {
        return sum + bill.value;
      }
      return sum;
    }, 0);
  }, [allBills, startDate, endDate]);

  const monthlyExpenseChange = useMemo(() => {
    if (previousMonthTotal === 0) {
      return currentMonthTotal > 0 ? Infinity : 0;
    }
    const change =
      ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    return change;
  }, [currentMonthTotal, previousMonthTotal]);

  const chartData = useMemo(() => {
    if (filteredBills.length === 0) {
      return { labels: [], datasets: [] };
    }

    const sortedBills = [...filteredBills].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      labels: sortedBills.map((bill) => bill.monthLabel),
      datasets: [
        {
          label: "My Bills",
          data: sortedBills.map((bill) => bill.value),
          tooltipLabels: sortedBills.map((bill) => bill.tooltipLabel),
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
    const newCategory = e.target.value;
    setIsTransitioning(true);
    setIsChartReady(false);
    setCategory(newCategory);
    setTriggerAIAnalyticsFetch(false); // Reset AI summary visibility when category changes
  }, []);

  const handleMonthYearRangeChange = useCallback(
    ({ startMonth, startYear, endMonth, endYear }) => {
      const newStartDate = new Date(startYear, startMonth, 1);
      const newEndDate = new Date(endYear, endMonth, 1);

      setStartDate(newStartDate);
      setEndDate(newEndDate);

      setIsTransitioning(true);
      setIsChartReady(false);
      setTriggerAIAnalyticsFetch(false); // Reset AI summary visibility when date range changes
    },
    []
  );

  const isChartLoading = billsLoading || isTransitioning;
  const hasChartData = filteredBills.length > 0;

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsChartReady(true);
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!billsLoading) {
      setIsChartReady(true);
    }
  }, [billsLoading, isTransitioning]);

  const isLoading = billsLoading || aiLoading;
  const error = billsError || aiError;

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const initialStartDate = new Date(currentYear, currentMonth, 1);
    setStartDate(initialStartDate);

    const initialEndDate = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
    setEndDate(initialEndDate);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    fetchBills(user.uid, category);
  }, [user?.uid, category, fetchBills]);

  // This useEffect will now *conditionally* call fetchAnalytics
  useEffect(() => {
    if (
      triggerAIAnalyticsFetch && // Only fetch if the button has been pressed
      !billsLoading &&
      startDate &&
      endDate &&
      user?.uid
    ) {
      const selectedYearForAI = startDate ? startDate.getFullYear() : null;
      fetchAnalytics(
        filteredBills,
        category,
        selectedYearForAI,
        user.uid,
        startDate,
        endDate
      );
    }
  }, [
    triggerAIAnalyticsFetch, // New dependency
    billsLoading,
    filteredBills,
    category,
    startDate,
    endDate,
    fetchAnalytics,
    user?.uid,
  ]);

  if (!user) {
    return (
      <div className="flex h-screen w-screen bg-[#1B1C21] text-white items-center justify-center">
        <p className="text-xl">Please log in to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
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

      <main className="w-full md:ml-[20%] flex-1 flex flex-col px-4 md:px-14 py-10 mt-8 md:mt-0 overflow-y-auto">
        <AnalyticsHeader
          category={category}
          onCategoryChange={handleCategoryChange}
          onMonthYearRangeChange={handleMonthYearRangeChange}
          isLoading={isLoading}
        />

        <ChartContainer
          chartData={chartData}
          chartOptions={chartOptions}
          isLoading={isChartLoading}
        />

        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8">
          <AnalyticsSummary
            summary={summary}
            suggestion={suggestion}
            isLoading={aiLoading}
            error={error}
            // NEW PROP: Pass the function to trigger the fetch
            onGenerateSummaryClick={() => setTriggerAIAnalyticsFetch(true)}
            // NEW PROP: Pass down the trigger state to control visibility of button
            aiGenerateSummary={triggerAIAnalyticsFetch}
          />
          <MonthlyExpenseCard
            monthlyTotal={currentMonthTotal}
            percentageChange={monthlyExpenseChange}
            isLoading={!isChartReady}
            hasData={true}
          />
        </div>
      </main>
    </div>
  );
}
