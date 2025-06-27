import React from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
    return (
        <div className="flex h-screen w-screen">
            <Sidebar />

            <div className="flex-1 p-10 relative">
                <h1 className="text-3xl font-bold mb-8">
                    Recent Summarized Bills
                </h1>

                <div className="grid grid-cols-2 gap-8">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="border rounded-lg p-4 flex">
                            <div className="w-24 h-24 bg-gray-200 rounded mr-4"></div>
                            <div className="flex flex-col justify-between">
                                <div>
                                    <p className="font-bold">Meralco Bill</p>
                                    <p className="text-sm text-gray-600">
                                        Short description of the bill...
                                    </p>
                                </div>
                                <p className="text-sm mt-4">xx/xx/xxxx</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="absolute bottom-10 right-10 px-6 py-3 border-2 font-semibold rounded-full hover:bg-gray-100">
                    + Upload your Bill
                </button>
            </div>
        </div>
    );
}
