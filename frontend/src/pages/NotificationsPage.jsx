import React from "react";
import Sidebar from "../components/Sidebar";

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
    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white">
            <Sidebar />
            <main className="ml-[20%] flex-1 flex flex-col min-h-screen px-14 py-10">
                <h1 className="text-4xl font-bold mb-8 text-white">
                    Notifications
                </h1>
                <div className="flex flex-col gap-5">
                    {notifications.map((notif, idx) => (
                        <div
                            key={idx}
                            className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-5 flex flex-col shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-bold text-white text-lg">
                                        {notif.title}
                                    </span>
                                    <p className="text-gray-300 text-base mt-1">
                                        {notif.message}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400 mt-1 ml-6 min-w-[80px] text-right">
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
