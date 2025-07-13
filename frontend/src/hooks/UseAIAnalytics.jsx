import { useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// Changed to deployed API via Render
const API_URL = "https://explain-my-bills.onrender.com";

const generateDataHash = (bills) =>
  JSON.stringify(bills.map((b) => [b.tooltipLabel, b.value]));

export const UseAIAnalytics = () => {
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cache, setCache] = useState({});
  const [lastFetched, setLastFetched] = useState({
    userId: null,
    category: null,
    year: null,
  });

  const fetchAnalytics = useCallback(
    async (bills, category, year, userId) => {
      if (!userId || !category || !year || !Array.isArray(bills)) {
        console.warn("Missing or invalid parameters for fetchAnalytics");
        return;
      }

      const cacheKey = `${category}-${year}`;
      if (lastFetched.category === category && lastFetched.year === year) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const docRef = doc(
          db,
          "users",
          userId,
          "analytics",
          `${category}_${year}`
        );
        const docSnap = await getDoc(docRef);

        const payload = bills
          .slice(0, 12)
          .map((bill) => `Date: ${bill.tooltipLabel}, Value: ${bill.value}`)
          .join("\n");

        const currentHash = generateDataHash(bills);

        if (!bills || bills.length === 0 || !payload.trim()) {
          setSummary("No analysis available for the selected data.");
          setSuggestion("");
          setLastFetched({ category, year });
          return;
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          const savedHash = data.dataHash;

          if (savedHash === currentHash) {
            setSummary(data.summary || "No summary found.");
            setSuggestion(data.suggestion || "No suggestion found.");
            setLastFetched({ category, year });
            console.log("Loaded summary from Firestore cache (hash match)");
            return;
          }

          console.log("Bill data changed, regenerating summary...");
        }

        const response = await fetch(`${API_URL}/bill/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ time_series_data: payload }),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (
            response.status === 429 ||
            (typeof errorData.detail === "string" &&
              errorData.detail.includes("429"))
          ) {
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
          console.error("JSON parse error:", parseErr, json.response);
          throw new Error("Invalid response format from AI service");
        }

        const summaryText = aiOutput.summary || "No summary provided.";
        const suggestionText =
          aiOutput.suggestion || "No suggestions provided.";

        setSummary(summaryText);
        setSuggestion(suggestionText);
        setLastFetched({ category, year });

        await setDoc(docRef, {
          category,
          year,
          summary: summaryText,
          suggestion: suggestionText,
          dataHash: currentHash,
          updatedAt: new Date(),
        });

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
