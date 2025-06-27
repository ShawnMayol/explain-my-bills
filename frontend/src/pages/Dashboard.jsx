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
    <div className="flex h-screen w-screen">
      <Sidebar />

      <div className="flex-1 p-10 relative overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Recent Summarized Bills</h1>

        <div className="grid grid-cols-2 gap-8">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <div key={bill.id} className="border rounded-lg p-4 flex">
                {bill.imageUrl ? (
                  <img
                    src={bill.imageUrl}
                    alt="Bill"
                    className="w-24 h-24 object-cover rounded mr-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded mr-4"></div>
                )}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-bold">
                      {bill.issuer || bill.billType || "Unnamed Bill"}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {bill.explanation?.slice(0, 60) ||
                        "No explanation available."}
                    </p>
                  </div>
                  <p className="text-sm mt-4 text-gray-500">
                    {bill.billDate || "No Date"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2">
              No bills found for this account.
            </p>
          )}
        </div>

        <Link
          to="/bill/summarization"
          className="absolute bottom-10 right-10 px-6 py-3 border-2 font-semibold rounded-full hover:bg-gray-100 text-center"
        >
          + Upload your Bill
        </Link>
      </div>
    </div>
  );
}
