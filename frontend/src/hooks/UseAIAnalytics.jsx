import { useState, useCallback } from "react";

const API_URL = "http://localhost:8000";

export const UseAIAnalytics = () => {
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cache, setCache] = useState({});
  const [lastFetched, setLastFetched] = useState({
    category: null,
    year: null,
  });

  const fetchAnalytics = useCallback(
    async (bills, category, year) => {
      const cacheKey = `${category}-${year}`;
      if (lastFetched.category === category && lastFetched.year === year) {
        return;
      }

      if (cache[cacheKey]) {
        const cached = cache[cacheKey];
        setSummary(cached.summary);
        setSuggestion(cached.suggestion);
        setLastFetched({ category, year });
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const payload = bills
          .slice(0, 12)
          .map((bill) => `Date: ${bill.tooltipLabel}, Value: ${bill.value}`)
          .join("\n");

        if (!payload.trim()) {
          setSummary("No data available for analysis.");
          setSuggestion("");
          setLastFetched({ category, year });
          return;
        }

        const response = await fetch(`${API_URL}/bill/analytics`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ time_series_data: payload }),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 429 || errorData.detail?.includes("429")) {
            throw new Error(
              "AI analysis limit reached. Please try again later."
            );
          }

          throw new Error(
            errorData.message ||
              `Server error: ${response.status} ${response.statusText}`
          );
        }

        const json = await response.json();
        let aiOutput;

        try {
          aiOutput =
            typeof json.response === "string"
              ? JSON.parse(json.response)
              : json.response;
        } catch (parseErr) {
          console.error(
            "JSON parse error:",
            parseErr,
            "Raw response:",
            json.response
          );
          throw new Error("Invalid response format from AI service");
        }

        const summaryText = aiOutput.summary || "No summary provided.";
        const suggestionText =
          aiOutput.suggestion || "No suggestions provided.";

        setSummary(summaryText);
        setSuggestion(suggestionText);
        setLastFetched({ category, year });

        setCache((prev) => ({
          ...prev,
          [cacheKey]: {
            summary: summaryText,
            suggestion: suggestionText,
            timestamp: Date.now(),
          },
        }));
      } catch (err) {
        console.error("AI Analytics Error:", err);
        setError(
          err.message || "Failed to load AI analysis. Please try again."
        );
        setSummary("Unable to load analysis.");
        setSuggestion("");
        setLastFetched({ category, year });
      } finally {
        setIsLoading(false);
      }
    },
    [cache, lastFetched]
  );

  return { summary, suggestion, isLoading, error, fetchAnalytics };
};
