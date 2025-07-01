import React from "react";
import Sidebar from "../components/Sidebar";

const bills = [
    {
        name: "Meralco Electric Bill",
        date: "June 28, 2025",
    },
    {
        name: "PLDT Bill",
        date: "July 1, 2025",
    },
];

export default function BillsPage() {
    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white">
            <Sidebar />
            <main className="ml-[20%] flex-1 flex flex-col min-h-screen px-14 py-10">
                <h1 className="text-4xl font-bold mb-8 text-white">Bills</h1>

                {/* Calendar Placeholder */}
                <div className="bg-zinc-900 border border-white/30 rounded-xl h-48 flex items-center justify-center mb-10">
                    <span className="text-gray-400 font-bold text-lg select-none">
                        Calendar for Recurring Bills
                    </span>
                </div>

                {/* Bill Cards */}
                <div className="flex flex-col gap-5">
                    {bills.map((bill, idx) => (
                        <div
                            key={idx}
                            className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between shadow"
                        >
                            <div>
                                <span className="font-bold text-white text-lg">
                                    {bill.name}
                                </span>
                                <p className="text-gray-300 text-base mt-1">
                                    Next Bill Date: {bill.date}
                                </p>
                            </div>
                            <button className="mt-4 md:mt-0 border-2 border-yellow-300 text-yellow-300 rounded-full px-8 py-2 font-bold hover:bg-yellow-300 hover:text-black transition">
                                Edit
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                <div className="flex justify-end mt-12">
                    <button className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-8 py-3 text-xl font-bold hover:bg-yellow-300 hover:text-black transition shadow">
                        + Add Recurring Bill
                    </button>
                </div>
            </main>
        </div>
    );
}
