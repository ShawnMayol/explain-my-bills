import React, { useState } from "react";

export const MirrAnalyticsSummary = ({ summary, suggestion, isLoading, error }) => {

  // AI generate summary
  const [aiGenerateSummary, setAiGenerateSummary] = useState(false);

  // Generate AI summary
  const generateOnClick = () => { setAiGenerateSummary(true);}

  return (
    <div className="flex-1 bg-zinc-900 border-2 border-white/20 rounded-xl p-5 overflow-y-auto">
      <h2 className="font-bold mb-2">Summary and Suggestions</h2>

      {!aiGenerateSummary && 
          <button
          onClick={generateOnClick}
          className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition cursor-pointer"
          >
            Generate Summary and Suggestions
          </button>
      }

      {(aiGenerateSummary && error) && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {(aiGenerateSummary && isLoading) ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
          <span className="text-gray-400">Loading analysis...</span>
        </div>
      ) : (aiGenerateSummary && summary) ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-yellow-300 mb-2">Summary</h3>
            <p className="text-gray-200">{summary}</p>
          </div>
          {suggestion && (
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">
                Suggestions
              </h3>
              <p className="text-gray-200">{suggestion}</p>
            </div>
          )}
        </div>
      ) : (aiGenerateSummary && !summary) && (
        <p className="text-gray-400">
          No analysis available for the selected data.
        </p>
      )}
    </div>
  );
};
