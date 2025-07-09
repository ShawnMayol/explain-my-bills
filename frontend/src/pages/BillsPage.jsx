import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";

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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div
                className={`fixed top-0 left-0 right-0 z-30 md:hidden flex items-center h-12 px-4 py-7 transition-colors duration-300 bg-black/10`}
            >
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <main className="w-full md:ml-[20%] flex-1 flex flex-col min-h-screen px-4 md:px-14 py-10 mt-16 md:mt-0 overflow-y-auto">
                <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">Bills</h1>

                {/* Calendar Placeholder */}
                <div className="bg-zinc-900 border border-white/30 rounded-xl h-36 md:h-48 flex items-center justify-center mb-6 md:mb-10">
                    <span className="text-gray-400 font-bold text-base md:text-lg select-none text-center px-4">
                        Calendar for Recurring Bills
                    </span>
                </div>

                {/* Bill Cards */}
                <div className="flex flex-col gap-4 md:gap-5">
                    {bills.map((bill, idx) => (
                        <div
                            key={idx}
                            className="bg-zinc-900 border border-white/30 rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between shadow"
                        >
                            <div>
                                <span className="font-bold text-white text-base md:text-lg">
                                    {bill.name}
                                </span>
                                <p className="text-gray-300 text-sm md:text-base mt-1">
                                    Next Bill Date: {bill.date}
                                </p>
                            </div>
                            <button className="mt-4 md:mt-0 border-2 border-yellow-300 text-yellow-300 rounded-full px-6 md:px-8 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition">
                                Edit
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                <div className="flex justify-center md:justify-end mt-8 md:mt-12">
                    <button className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-6 md:px-8 py-2 md:py-3 text-lg md:text-xl font-bold hover:bg-yellow-300 hover:text-black transition shadow">
                        + Add Recurring Bill
                    </button>
                </div>
            </main>
        </div>
    );
}
