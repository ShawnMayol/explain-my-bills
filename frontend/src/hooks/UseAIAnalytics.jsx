import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

const generateBillId = (bill) => {
  if (bill.id) return bill.id;
  const fallbackId = `${bill.date || "no_date"}-${bill.value || 0}-${
    bill.category || "no_cat"
  }-${bill.description || "no_desc"}`;
  console.warn(
    "Analytics: Bill missing 'id'. Generating fallback ID. Ensure your bill objects from data source have a stable 'id'. Fallback:",
    fallbackId,
    bill
  );
  return fallbackId;
};

const generateBillIdsHash = (bills) => {
  if (!Array.isArray(bills) || bills.length === 0) {
    return "ids:no_data"; // Return a specific, distinct hash for no data
  }
  const uniqueBillIds = [...new Set(bills.map(generateBillId))].sort();
  console.log(
    "Analytics Debug: Bills mapped to IDs for hash:",
    bills.map(generateBillId)
  );
  console.log("Analytics Debug: Sorted uniqueBillIds for hash:", uniqueBillIds);
  const hash = `ids:${uniqueBillIds.join("-")}`;
  console.log("Analytics Debug: Generated Bill IDs Hash:", hash);
  return hash;
};

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const UseAIAnalytics = () => {
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetchedParams, setLastFetchedParams] = useState({
    userId: null,
    category: null,
    startDate: null,
    endDate: null,
    billIdsHash: null,
  });

  const fetchAnalytics = useCallback(
    async (bills, category, selectedYear, userId, startDate, endDate) => {
      if (
        !userId ||
        !category ||
        !startDate ||
        !endDate ||
        !Array.isArray(bills)
      ) {
        console.warn(
          "Analytics: Missing or invalid parameters for fetchAnalytics. Returning."
        );
        setSummary("No analysis available.");
        setSuggestion("");
        setIsLoading(false);
        setError("");
        return;
      }

      const billsWithStableIds = bills.map((bill) => ({
        ...bill,
        id: generateBillId(bill),
      }));

      const currentBillIdsHash = generateBillIdsHash(billsWithStableIds);
      const currentBillIdsSet = new Set(
        billsWithStableIds.map((bill) => bill.id)
      );
      console.log(
        "Analytics Debug: Current Bill IDs Set for analysis:",
        Array.from(currentBillIdsSet)
      );

      const startKey =
        startDate instanceof Date
          ? startDate.toISOString().split("T")[0]
          : startDate;
      const endKey =
        endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate;

      // --- NEW: Handle "No Data" Scenario Early ---
      if (
        !billsWithStableIds ||
        billsWithStableIds.length === 0 ||
        currentBillIdsHash === "ids:no_data"
      ) {
        console.log(
          "Analytics: Current range has no bills. Displaying 'No analysis available'."
        );
        setSummary("No analysis available for the selected data.");
        setSuggestion("");
        setLastFetchedParams({
          userId,
          category,
          startDate: startKey,
          endDate: endKey,
          billIdsHash: currentBillIdsHash, // Store "ids:no_data" hash
        });
        setIsLoading(false);
        setError(""); // Ensure no previous errors are shown
        return; // Exit early, no need for cache or API call
      }
      // --- END NEW: Handle "No Data" Scenario Early ---

      // In-memory Cache Check: Prevent redundant calls if nothing changed
      if (
        lastFetchedParams.userId === userId &&
        lastFetchedParams.category === category &&
        lastFetchedParams.startDate === startKey &&
        lastFetchedParams.endDate === endKey &&
        lastFetchedParams.billIdsHash === currentBillIdsHash
      ) {
        console.log(
          "Analytics: Exact same parameters as last fetch, preventing redundant call. (In-memory cache hit)"
        );
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        let foundValidCache = null;
        let cacheHitReason = "No suitable cache found in localStorage.";

        const exactMatchCacheKey = `ai_summary_cache_${userId}_${category}_${currentBillIdsHash}`;

        // --- localStorage Cache Lookup (Exact Match First) ---
        const exactCachedData = localStorage.getItem(exactMatchCacheKey);
        if (exactCachedData) {
          try {
            const parsedData = JSON.parse(exactCachedData);
            if (
              parsedData.timestamp &&
              Date.now() - parsedData.timestamp < CACHE_DURATION_MS
            ) {
              // Ensure the cached entry *actually* stores the bill IDs for robustness
              // And that the size matches
              if (
                parsedData.analyzedBillIds &&
                new Set(parsedData.analyzedBillIds).size ===
                  currentBillIdsSet.size &&
                [...currentBillIdsSet].every((id) =>
                  new Set(parsedData.analyzedBillIds).has(id)
                )
              ) {
                foundValidCache = parsedData;
                cacheHitReason = `Loaded from exact match cache: ${exactMatchCacheKey}`;
              } else {
                console.log(
                  `Analytics Debug: Exact cache key ${exactMatchCacheKey} found but analyzedBillIds mismatch. Regenerating.`
                );
                localStorage.removeItem(exactMatchCacheKey);
              }
            } else {
              localStorage.removeItem(exactMatchCacheKey);
              console.log(
                `Analytics: Cleaned up stale exact match cache: ${exactMatchCacheKey}`
              );
            }
          } catch (e) {
            console.warn(
              `Analytics: Error parsing exact cache item ${exactMatchCacheKey}:`,
              e
            );
            localStorage.removeItem(exactMatchCacheKey);
          }
        }

        // --- If no exact match, search for a Superset Match ---
        if (!foundValidCache) {
          const baseCacheKeyPrefixForSupersetSearch = `ai_summary_cache_${userId}_${category}_ids:`;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              key.startsWith(baseCacheKeyPrefixForSupersetSearch) &&
              key !== exactMatchCacheKey
            ) {
              try {
                const cachedData = JSON.parse(localStorage.getItem(key));
                if (cachedData && cachedData.timestamp) {
                  const isStale =
                    Date.now() - cachedData.timestamp >= CACHE_DURATION_MS;

                  if (isStale) {
                    localStorage.removeItem(key);
                    console.log(
                      `Analytics: Cleaned up stale superset cache: ${key}`
                    );
                    continue;
                  }

                  if (
                    cachedData.analyzedBillIds &&
                    Array.isArray(cachedData.analyzedBillIds)
                  ) {
                    const analyzedIdsSet = new Set(cachedData.analyzedBillIds);
                    console.log(
                      `Analytics Debug: Checking superset cache key ${key}. Cached IDs:`,
                      Array.from(analyzedIdsSet)
                    );

                    const allCurrentBillsCovered = [...currentBillIdsSet].every(
                      (id) => analyzedIdsSet.has(id)
                    );

                    if (allCurrentBillsCovered) {
                      foundValidCache = cachedData;
                      cacheHitReason = `Loaded from superset cache (key: ${key}, all current bills covered).`;
                      break;
                    } else {
                      console.log(
                        `Analytics Debug: Cache ${key} is fresh but does not cover all current bills. Will continue searching.`
                      );
                    }
                  } else {
                    console.log(
                      `Analytics: Cache ${key} is fresh but missing analyzedBillIds. Treating as non-match.`
                    );
                  }
                }
              } catch (e) {
                console.warn(`Analytics: Error parsing cache item ${key}:`, e);
                localStorage.removeItem(key);
              }
            }
          }
        }

        // If a valid cache was found, use it and exit.
        if (foundValidCache) {
          setSummary(foundValidCache.summary);
          setSuggestion(foundValidCache.suggestion);
          setLastFetchedParams({
            userId,
            category,
            startDate: startKey,
            endDate: endKey,
            billIdsHash: currentBillIdsHash,
          });
          setIsLoading(false);
          console.log(`Analytics: Cache HIT! ${cacheHitReason}`);
          return;
        }

        console.log(
          `Analytics: Cache MISS. ${cacheHitReason} Proceeding to generate new summary.`
        );

        // --- REAL AI API Call ---
        const payload = billsWithStableIds
          .slice(0, 100)
          .map((bill) => {
            const billDate = new Date(bill.date);
            const formattedDate = billDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return `Date: ${formattedDate}, Category: ${
              bill.category || category
            }, Value: ${bill.value}, Description: ${bill.description || ""}`;
          })
          .join("\n");

        console.log("Analytics: Fetching new AI summary from actual API..." + payload);
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
          if (
            !aiOutput ||
            (typeof aiOutput.summary !== "string" &&
              typeof aiOutput.suggestion !== "string")
          ) {
            throw new Error("Unexpected AI response format from backend.");
          }
        } catch (parseErr) {
          console.error(
            "Analytics: JSON parse or format error:",
            parseErr,
            json.response
          );
          throw new Error("Invalid response format from AI service.");
        }

        const summaryText = aiOutput.summary || "No summary provided.";
        const suggestionText =
          aiOutput.suggestion || "No suggestions provided.";

        setSummary(summaryText);
        setSuggestion(suggestionText);
        setLastFetchedParams({
          userId,
          category,
          startDate: startKey,
          endDate: endKey,
          billIdsHash: currentBillIdsHash,
        });

        // --- Save the newly generated summary to localStorage Cache ---
        localStorage.setItem(
          exactMatchCacheKey,
          JSON.stringify({
            summary: summaryText,
            suggestion: suggestionText,
            timestamp: Date.now(),
            analyzedBillIds: Array.from(currentBillIdsSet),
          })
        );
        console.log(
          "Analytics: New AI summary generated and saved to localStorage cache:",
          exactMatchCacheKey
        );
      } catch (err) {
        console.error("AI Analytics Error:", err);
        setError(
          err.message || "Failed to load AI analysis. Please try again."
        );
        setSummary("Unable to load analysis.");
        setSuggestion("");
        setLastFetchedParams({
          userId,
          category,
          startDate: startKey,
          endDate: endKey,
          billIdsHash: currentBillIdsHash,
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { summary, suggestion, isLoading, error, fetchAnalytics };
};
