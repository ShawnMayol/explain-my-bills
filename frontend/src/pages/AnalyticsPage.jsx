import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const CATEGORIES = ["Utilities", "Telecom", "Medical"];

export default function AnalyticsPage() {
    const [category, setCategory] = useState(CATEGORIES[0]);

    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white">
            <Sidebar />
            <main className="ml-[20%] flex-1 flex flex-col min-h-screen px-14 py-10">
                <div className="flex flex-col w-full h-full">
                    {/* Header row */}
                    <div className="flex items-center mb-8">
                        <h1 className="text-4xl font-bold text-white mr-8">
                            {category}
                        </h1>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-zinc-900 border border-white/30 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300 mr-4"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <button
                            className="px-5 py-2 border-2 border-yellow-300 rounded-full text-yellow-300 font-semibold transition hover:bg-yellow-300 hover:text-black"
                            // NOTE: Logic for updating category display is handled elsewhere!
                        >
                            Change
                        </button>
                    </div>

                    {/* Line graph */}
                    <div className="w-full bg-zinc-900 border-2 border-white/20 rounded-xl mb-8 flex items-center justify-center h-[220px]">
                        <span className="text-gray-400 text-lg font-semibold opacity-50">
                            Line Graph for: Day vs Total Bill
                        </span>
                    </div>

                    {/* Summary + Annual Expense */}
                    <div className="flex w-full gap-8">
                        <div className="flex-1 bg-zinc-900 border-2 border-white/20 rounded-xl p-5 min-h-[160px] flex flex-col">
                            <span className="text-white font-bold mb-2">
                                Summary and Suggestions
                            </span>
                            <span className="text-gray-400 opacity-40">
                                AI Summarization and Suggestions
                            </span>
                        </div>
                        <div className="w-[300px] h-[100px] bg-zinc-900 border-2 border-white/20 rounded-xl flex flex-col items-center justify-center">
                            <span className="font-semibold text-white mb-1">
                                Annual Expense
                            </span>
                            <span className="font-bold text-2xl text-yellow-300">
                                Php 200,000.00
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
