import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";

const notifications = [
    {
        title: "Notification Title",
        message:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        date: "06/20/2025",
    },
    {
        title: "Notification Title",
        message:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        date: "06/19/2025",
    },
    {
        title: "Notification Title",
        message:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        date: "06/18/2025",
    },
    {
        title: "Notification Title",
        message:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        date: "06/17/2025",
    },
    {
        title: "Notification Title",
        message:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        date: "06/16/2025",
    },
];

export default function NotificationsPage() {
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
                <h1 className="text-2xl md:text-4xl font-bold mb-8 text-white">
                    Notifications
                </h1>
                <div className="flex flex-col gap-4 md:gap-5">
                    {notifications.map((notif, idx) => (
                        <div
                            key={idx}
                            className="bg-zinc-900 border border-white/30 rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col shadow"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start">
                                <div className="flex-1">
                                    <span className="font-bold text-white text-base md:text-lg">
                                        {notif.title}
                                    </span>
                                    <p className="text-gray-300 text-sm md:text-base mt-1">
                                        {notif.message}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400 mt-2 md:mt-1 md:ml-6 min-w-[80px] text-left md:text-right">
                                    {notif.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
