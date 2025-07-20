import React from "react";

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

export const MirrAnalyticsHeader = ({
    category,
    selectedYear,
    yearOptions,
    onCategoryChange,
    onYearChange,
    isLoading,
}) => {
    const currentCategoryLabel = CATEGORIES.find(
        (c) => c.value === category
    )?.label;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8 gap-4 sm:gap-6 w-full">

            {/* Category Label */}
            <h1 className="text-2xl sm:text-4xl font-bold">
                {currentCategoryLabel}
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">

                {/* Category Selection */}
                <select
                    value={category}
                    onChange={onCategoryChange}
                    className="bg-zinc-900 border border-white/30 rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-yellow-300 w-full sm:w-auto"
                    disabled={isLoading}
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>

                {/* Year Selection */}
                <select
                    value={selectedYear || ""}
                    onChange={onYearChange}
                    className="bg-zinc-900 border border-white/30 rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-yellow-300 w-full sm:w-auto"
                    disabled={isLoading}
                >
                    <option value="">Select Year</option>
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>

                
            </div>
        </div>
    );
};
