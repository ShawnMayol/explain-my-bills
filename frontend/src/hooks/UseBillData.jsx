import { useState, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export const UseBillData = () => {
  const [allBills, setAllBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cache, setCache] = useState({});
  const [lastFetched, setLastFetched] = useState({
    userId: null,
    category: null,
  });

  const fetchBills = useCallback(
    async (userId, category) => {
      const cacheKey = `${userId}-${category}`;

      if (lastFetched.userId === userId && lastFetched.category === category) {
        return;
      }

      if (cache[cacheKey]) {
        setAllBills(cache[cacheKey]);
        setLastFetched({ userId, category });
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const billsRef = collection(db, "users", userId, "bills");
        const q = query(billsRef, where("billType", "==", category));
        const snap = await getDocs(q);

        const bills = snap.docs
          .map((doc) => {
            const data = doc.data();
            const date = new Date(data.billDate);
            return {
              id: doc.id,
              date,
              monthLabel: date.toLocaleString("default", { month: "long" }),
              value: data.totalBill || 0,
              tooltipLabel: date.toLocaleDateString("default", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              year: date.getFullYear(),
            };
          })
          .filter((bill) => !isNaN(bill.value) && bill.value > 0)
          .sort((a, b) => a.date - b.date);

        setAllBills(bills);
        setCache((prev) => ({ ...prev, [cacheKey]: bills }));
        setLastFetched({ userId, category });
        return bills;
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to fetch bills. Please try again.");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [cache, lastFetched]
  );

  return { allBills, isLoading, error, fetchBills };
};
