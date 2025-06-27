import React from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
    return (
        <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
            <Sidebar />
            <div className="absolute left-80 -top-30 w-150 h-150 rounded-full bg-gray-100 opacity-8 blur-3xl pointer-events-none z-0"></div>
            <div className="absolute -right-20 -bottom-40 w-90 h-90 rounded-full bg-gray-100 opacity-8 blur-3xl pointer-events-none z-0"></div>

            <div className="flex-1 p-10 relative">
                <h1 className="text-3xl text-yellow-300 font-bold mt-15 mb-8">
                    Recent Summarized Bills
                </h1>

                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-2 flex bg-zinc-900">
                            <img src="" alt="bill image" className="w-32 h-full bg-gray-300 rounded-lg mr-4 text-xs object-cover" />

                            <div className="flex flex-col justify-between flex-1 p-1">
                                <div>
                                    <p className="mt-2 font-semibold text-sm text-center">Meralco Bill</p>
                                    <p className="mt-3 text-[10px] text-gray-300 text-justify hyphens-auto">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 text-end">xx/xx/xxxx</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="absolute bottom-10 right-10 px-6 py-3 border-2 border-white text-2xl font-semibold rounded-3xl hover:bg-gray-100 hover:text-black transition">
                    +
                </button>
            </div>
        </div>
    );
}
