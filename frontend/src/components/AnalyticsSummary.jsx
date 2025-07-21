import React, { useState, useEffect } from "react";

export const AnalyticsSummary = ({
  summary,
  suggestion,
  isLoading,
  error,
  onGenerateSummaryClick, // Function to trigger AI fetch in parent (AnalyticsPage)
  aiGenerateSummary: parentAiGenerateSummary, // The trigger state from the parent (AnalyticsPage)
}) => {
  // `localAiGenerateSummary` controls the visibility of the button vs. content
  // It's synchronized with `parentAiGenerateSummary` to reset when filters change.
  const [localAiGenerateSummary, setLocalAiGenerateSummary] = useState(false);

  // Synchronize local state with parent prop.
  // When filters in AnalyticsPage change, `parentAiGenerateSummary` becomes false,
  // causing this to reset and show the button again.
  useEffect(() => {
    setLocalAiGenerateSummary(parentAiGenerateSummary);
  }, [parentAiGenerateSummary]);

  // Handles the click event for the "Generate Summary" button
  const generateOnClick = () => {
    setLocalAiGenerateSummary(true); // Hide the button, show loading/content area
    if (onGenerateSummaryClick) {
      onGenerateSummaryClick(); // Call the parent's function to trigger the AI analysis
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 border-2 border-white/20 rounded-xl p-5 overflow-y-auto">
      <h2 className="font-bold mb-2 text-white">Summary and Suggestions</h2>

      {/* Show the button if localAiGenerateSummary is false */}
      {!localAiGenerateSummary && (
        <button
          onClick={generateOnClick}
          className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition cursor-pointer"
        >
          Generate Summary and Suggestions
        </button>
      )}

      {/* Display error message if there's an error and summary generation was attempted */}
      {localAiGenerateSummary && error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Conditional rendering for loading state or displaying summary/suggestion */}
      {localAiGenerateSummary && isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
          <span>Loading analysis...</span>
        </div>
      ) : localAiGenerateSummary && summary ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-yellow-300 mb-2">Summary</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{summary}</p>
          </div>
          {suggestion && (
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2 mt-4">
                Suggestions
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                {suggestion}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Display message if summary generation was attempted but no data/summary available
        localAiGenerateSummary &&
        !summary && (
          <p className="text-gray-400 text-sm">
            No analysis available for the selected data.
          </p>
        )
      )}
    </div>
  );
};
