import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Define the categories for the filter
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

/**
 * AnalyticsHeader Component
 * A header component for analytics dashboards, providing category and month/year filtering.
 *
 * @param {object} props - The component props.
 * @param {string} props.category - The currently selected category value.
 * @param {function} props.onCategoryChange - Callback function for when the category changes.
 * @param {function} props.onMonthYearRangeChange - Callback function for when the month/year range filter changes.
 * Receives an object: { startMonth: number, startYear: number, endMonth: number, endYear: number }.
 * @param {boolean} props.isLoading - Indicates if data is currently loading, disables controls.
 */
export const AnalyticsHeader = ({
  category,
  onCategoryChange,
  onMonthYearRangeChange, // Changed prop name for range
  isLoading,
}) => {
  // Find the label for the currently selected category
  const currentCategoryLabel = CATEGORIES.find(
    (c) => c.value === category
  )?.label;

  // State to control the visibility of the month/year picker
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  // State for the currently displayed month/year in the picker (for navigation)
  const [currentMonthYear, setCurrentMonthYear] = useState(new Date());
  // State for the start of the selected month/year range
  const [rangeStartMonthYear, setRangeStartMonthYear] = useState(null);
  // State for the end of the selected month/year range
  const [rangeEndMonthYear, setRangeEndMonthYear] = useState(null);

  // Ref for the picker container to detect clicks outside
  const pickerRef = useRef(null);

  // Effect to set the initial month/year filter when the component mounts
  useEffect(() => {
    const initialDate = new Date();
    // Initialize both start and end to the current month/year
    setRangeStartMonthYear(initialDate);
    setRangeEndMonthYear(initialDate);
    // Also set the currentMonthYear for the picker display
    setCurrentMonthYear(initialDate);

    // Call the parent's handler with the initial current month and year range
    if (onMonthYearRangeChange) {
      onMonthYearRangeChange({
        startMonth: initialDate.getMonth(),
        startYear: initialDate.getFullYear(),
        endMonth: initialDate.getMonth(),
        endYear: initialDate.getFullYear(),
      });
    }
  }, [onMonthYearRangeChange]); // Dependency array includes onMonthYearRangeChange

  // Effect to handle clicks outside the picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the picker, close it
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]); // Dependency array includes pickerRef

  /**
   * Handles the selection of a month and year from the picker for a range.
   * Updates the selected month/year range state and notifies the parent component.
   * @param {number} month - The selected month (0-11).
   * @param {number} year - The selected year.
   */
  const handleMonthYearSelect = (month, year) => {
    const clickedDate = new Date(year, month, 1); // Create a Date object for the first day of the clicked month

    if (!rangeStartMonthYear || (rangeStartMonthYear && rangeEndMonthYear)) {
      // If no start is selected, or if a full range is already selected, start a new range
      setRangeStartMonthYear(clickedDate);
      setRangeEndMonthYear(null); // Clear end to indicate single selection
    } else {
      // If only start is selected, set the end of the range
      if (clickedDate.getTime() >= rangeStartMonthYear.getTime()) {
        setRangeEndMonthYear(clickedDate);
      } else {
        // If clicked date is before start, swap them
        setRangeEndMonthYear(rangeStartMonthYear);
        setRangeStartMonthYear(clickedDate);
      }
    }
  };

  // Effect to apply the filter when both start and end dates are selected
  useEffect(() => {
    if (rangeStartMonthYear && rangeEndMonthYear) {
      if (onMonthYearRangeChange) {
        onMonthYearRangeChange({
          startMonth: rangeStartMonthYear.getMonth(),
          startYear: rangeStartMonthYear.getFullYear(),
          endMonth: rangeEndMonthYear.getMonth(),
          endYear: rangeEndMonthYear.getFullYear(),
        });
      }
      // Crucial fix: Set currentMonthYear to the start of the selected range
      // so the picker reopens to the correct view.
      setCurrentMonthYear(rangeStartMonthYear);
      setIsPickerOpen(false); // Close the picker after range selection
    }
  }, [rangeStartMonthYear, rangeEndMonthYear, onMonthYearRangeChange]); // Dependencies for this effect

  /**
   * Formats the selected month/year range for display in the button.
   * @returns {string} The formatted date range string.
   */
  const formatMonthYearRange = () => {
    const formatOptions = { month: "short", year: "numeric" };
    if (rangeStartMonthYear && rangeEndMonthYear) {
      const start = rangeStartMonthYear.toLocaleDateString(
        "en-US",
        formatOptions
      );
      const end = rangeEndMonthYear.toLocaleDateString("en-US", formatOptions);
      return `${start} - ${end}`;
    } else if (rangeStartMonthYear) {
      // If only the start date is selected, indicate that the user needs to select the end date
      return `${rangeStartMonthYear.toLocaleDateString(
        "en-US",
        formatOptions
      )} - Select End`;
    }
    return "Select month range";
  };

  /**
   * Checks if a given month/year is within the selected range.
   * @param {number} month - The month to check (0-11).
   * @param {number} year - The year to check.
   * @returns {boolean} True if the month/year is within the range, false otherwise.
   */
  const isMonthYearInRange = (month, year) => {
    if (!rangeStartMonthYear) return false;

    const checkDate = new Date(year, month, 1);
    const start = rangeStartMonthYear;
    const end = rangeEndMonthYear || rangeStartMonthYear; // If end is null, consider it a single-month range

    return (
      checkDate.getTime() >= start.getTime() &&
      checkDate.getTime() <= end.getTime()
    );
  };

  /**
   * Checks if a given month/year is the start of the selected range.
   * @param {number} month - The month to check (0-11).
   * @param {number} year - The year to check.
   * @returns {boolean} True if it's the start month/year, false otherwise.
   */
  const isRangeStart = (month, year) => {
    return (
      rangeStartMonthYear &&
      rangeStartMonthYear.getMonth() === month &&
      rangeStartMonthYear.getFullYear() === year
    );
  };

  /**
   * Checks if a given month/year is the end of the selected range.
   * @param {number} month - The month to check (0-11).
   * @param {number} year - The year to check.
   * @returns {boolean} True if it's the end month/year, false otherwise.
   */
  const isRangeEnd = (month, year) => {
    return (
      rangeEndMonthYear &&
      rangeEndMonthYear.getMonth() === month &&
      rangeEndMonthYear.getFullYear() === year
    );
  };

  /**
   * Generates an array of years for the year dropdown in the picker.
   * Shows a range of 11 years (current year +/- 5).
   * @returns {number[]} An array of year numbers.
   */
  const getYearsForPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const yearsOptions = getYearsForPicker(); // Get the list of years for the dropdown
  // Array of month names for displaying in the picker
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8 gap-4 sm:gap-6 w-full font-sans">
      {/* Category Title */}
      <h1 className="text-2xl sm:text-4xl font-bold text-white">
        {currentCategoryLabel}
      </h1>

      {/* Filter Controls Container */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
        {/* Category Select Dropdown - Now styled to match the date picker */}
        <div className="relative w-full sm:w-auto">
          <select
            value={category}
            onChange={onCategoryChange}
            // Updated classes to match the date picker button
            className="w-full bg-zinc-900/60 backdrop-blur border border-white/20 rounded-xl pr-10 pl-4 py-3 font-semibold text-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
            disabled={isLoading}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {/* ChevronDown icon embedded directly */}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Option for filtering the chart by range-Month and Year */}
        <div className="relative flex-1" ref={pickerRef}>
          {/* Button to open/close the picker */}
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            disabled={isLoading}
            className="w-full bg-zinc-900/60 backdrop-blur border border-white/20 rounded-xl px-4 py-3 font-semibold text-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-white">{formatMonthYearRange()}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isPickerOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Month and Year Picker Dropdown Content */}
          {isPickerOpen && (
            <div className="absolute top-full left-0 mt-2 bg-zinc-900/95 backdrop-blur border border-white/10 rounded-2xl shadow-2xl z-50 p-6 min-w-[300px] sm:min-w-[350px]">
              {/* Year Navigation (Previous/Next Year) */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() =>
                    setCurrentMonthYear(
                      new Date(
                        currentMonthYear.getFullYear() - 1,
                        currentMonthYear.getMonth()
                      )
                    )
                  }
                  className="p-2 rounded-lg hover:bg-zinc-800/60 transition-colors text-gray-400"
                  aria-label="Previous Year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-semibold text-white">
                  {currentMonthYear.getFullYear()}
                </h3>
                <button
                  onClick={() =>
                    setCurrentMonthYear(
                      new Date(
                        currentMonthYear.getFullYear() + 1,
                        currentMonthYear.getMonth()
                      )
                    )
                  }
                  className="p-2 rounded-lg hover:bg-zinc-800/60 transition-colors text-gray-400"
                  aria-label="Next Year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-3 gap-2">
                {months.map((monthName, index) => {
                  const inRange = isMonthYearInRange(
                    index,
                    currentMonthYear.getFullYear()
                  );
                  const isStart = isRangeStart(
                    index,
                    currentMonthYear.getFullYear()
                  );
                  const isEnd = isRangeEnd(
                    index,
                    currentMonthYear.getFullYear()
                  );

                  return (
                    <button
                      key={monthName}
                      onClick={() =>
                        handleMonthYearSelect(
                          index,
                          currentMonthYear.getFullYear()
                        )
                      }
                      className={`h-10 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          inRange && !isStart && !isEnd
                            ? "bg-yellow-400/20" // Highlight for months within the range
                            : ""
                        }
                        ${
                          isStart || isEnd
                            ? "bg-yellow-400 text-black" // Highlight for start/end months
                            : "text-white hover:bg-yellow-400/10" // Default/hover style
                        }
                        ${isStart && !isEnd ? "rounded-r-none" : ""}
                        ${isEnd && !isStart ? "rounded-l-none" : ""}
                        ${isStart && isEnd ? "rounded-lg" : ""}
                      `}
                    >
                      {monthName.substring(0, 3)}{" "}
                      {/* Display short month name (e.g., Jan, Feb) */}
                    </button>
                  );
                })}
              </div>

              {/* Year Selector Dropdown (Optional, but good for quick jumps) */}
              <div className="mt-4">
                <select
                  value={currentMonthYear.getFullYear()}
                  onChange={(e) =>
                    setCurrentMonthYear(
                      new Date(
                        parseInt(e.target.value),
                        currentMonthYear.getMonth()
                      )
                    )
                  }
                  className="w-full bg-zinc-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer"
                >
                  {yearsOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App component to demonstrate AnalyticsHeader usage
export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("utility");
  const [filteredStartMonth, setFilteredStartMonth] = useState(
    new Date().getMonth()
  );
  const [filteredStartYear, setFilteredStartYear] = useState(
    new Date().getFullYear()
  );
  const [filteredEndMonth, setFilteredEndMonth] = useState(
    new Date().getMonth()
  );
  const [filteredEndYear, setFilteredEndYear] = useState(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState(false); // Example loading state

  // Handler for category changes
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    // In a real application, you would trigger data fetching here
    console.log("Category changed to:", event.target.value);
  };

  // Handler for month and year range filter changes
  const handleMonthYearRangeChange = ({
    startMonth,
    startYear,
    endMonth,
    endYear,
  }) => {
    setFilteredStartMonth(startMonth);
    setFilteredStartYear(startYear);
    setFilteredEndMonth(endMonth);
    setFilteredEndYear(endYear);
    // In a real application, you would trigger data fetching here
    console.log("Filtering by Range: From", { startMonth, startYear }, "To", {
      endMonth,
      endYear,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 flex flex-col items-center">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          /* This custom styling for select dropdown arrow is now less critical
             because the icon is embedded directly in AnalyticsHeader.
             However, it's kept for potential other select elements or
             if you decide to revert to a CSS-only approach. */
          select {
            /* background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e"); */
            /* background-repeat: no-repeat; */
            /* background-position: right 0.75rem center; */
            /* background-size: 0.65rem auto; */
          }
        `}
      </style>
      <div className="w-full max-w-4xl">
        <AnalyticsHeader
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
          onMonthYearRangeChange={handleMonthYearRangeChange} // Pass the new prop
          isLoading={loading}
        />

        {/* Display current filter values for demonstration */}
        <div className="mt-12 p-6 bg-zinc-900 rounded-xl shadow-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-yellow-300">
            Current Filters Applied:
          </h2>
          <p className="text-lg mb-2">
            <span className="font-medium text-gray-400">Category:</span>{" "}
            <span className="text-white">
              {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
            </span>
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-400">
              Month & Year Range:
            </span>{" "}
            <span className="text-white">
              {new Date(filteredStartYear, filteredStartMonth).toLocaleString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
              {" - "}
              {new Date(filteredEndYear, filteredEndMonth).toLocaleString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </span>
          </p>
          <p className="text-gray-500 text-sm mt-4">
            (You would typically fetch and display your analytics data here
            based on these filters.)
          </p>
        </div>
      </div>
    </div>
  );
}
