import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function Dashboard() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.warn("User not logged in");
        return;
      }

      try {
        const billsRef = collection(db, "users", user.uid, "bills");
        const snapshot = await getDocs(billsRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBills(data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    fetchBills();
  }, []);

  return (
    <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
      <Sidebar />
      <div className="absolute left-90 -top-30 w-160 h-160 rounded-full bg-gray-100 opacity-8 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -right-20 -bottom-40 w-90 h-90 rounded-full bg-gray-100 opacity-8 blur-3xl pointer-events-none z-0"></div>

      <div className="ml-[20%] flex-1 p-10 relative overflow-y-auto">
        <h1 className="text-3xl text-yellow-300 font-bold mt-15 mb-8">Recent Summarized Bills</h1>

        <div className="grid grid-cols-3 gap-3">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <div key={bill.id} className="border border-gray-600 rounded-lg p-2 flex bg-zinc-900">
                {bill.imageUrl ? (
                  <img
                    src={bill.imageUrl}
                    alt="Bill"
                    className="w-128 h-full object-cover rounded mr-4"
                  />
                ) : (
                  <div className="w-164 h-full bg-gray-200 rounded mr-4"></div>
                )}
                <div className="flex flex-col justify-between p-1">
                  <div>
                    <p className="mt-2 font-semibold text-sm text-center">
                      {bill.issuer || bill.billType || "Unnamed Bill"}
                    </p>
                    <p className="mt-3 text-[10px] text-gray-300 text-justify hyphens-auto line-clamp-4">
                      {bill.explanation?.slice(0, 192) ||
                        "No explanation available."}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-end">
                    {bill.billDate || "No Date"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-2">
              No bills found for this account.
            </p>
          )}
        </div>

        <Link
          to="/bill/summarization"
          className="absolute bottom-10 right-10 px-6 py-3 border-2 border-white text-2xl font-semibold rounded-3xl hover:bg-gray-100 hover:text-black transition"
        >
          +
        </Link>
      </div>
    </div>
  );
}
