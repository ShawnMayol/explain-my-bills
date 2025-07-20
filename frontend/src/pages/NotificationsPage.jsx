import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    // Default to showing notifications for the next 7 days
    const [daysToShow, setDaysToShow] = useState(7);

    const intervalOptions = [
        { value: "Weekly", label: "Weekly", days: 7 },
        { value: "Monthly", label: "Monthly", days: 30 },
        { value: "Bi-Annually", label: "Bi-Annually", days: 182 },
        { value: "Annually", label: "Annually", days: 365 },
    ];

    useEffect(() => {
        if (user) {
            loadBillsAndGenerateNotifications();
        }
    }, [user]);

    const loadBillsAndGenerateNotifications = async () => {
        try {
            // Load recurring bills from billsRecurring collection
            const billsRef = collection(
                db,
                "users",
                user.uid,
                "billsRecurring"
            );
            const q = query(billsRef, orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const billsData = [];
            querySnapshot.forEach((doc) => {
                billsData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            setBills(billsData);

            // Generate notifications directly from bills data
            // No need to query a separate notifications collection
            const generatedNotifications = generateBillNotifications(billsData);

            // Sort notifications by urgency and due date
            const sortedNotifications = generatedNotifications.sort((a, b) => {
                const urgencyOrder = { urgent: 3, high: 2, normal: 1 };
                if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                }
                return new Date(b.dueDate) - new Date(a.dueDate);
            });

            setNotifications(sortedNotifications);
        } catch (error) {
            console.error("Error loading bills:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const generateBillNotifications = (billsData) => {
        const today = new Date();
        const notifications = [];

        for (const bill of billsData) {
            // Use billingStart field (fallback to lastPaymentDate for backward compatibility)
            const billingStartDate = bill.billingStart || bill.lastPaymentDate;
            const daysUntilDue = getDaysUntilDue(
                billingStartDate,
                bill.interval
            );

            // Only include bills due today or in the future, up to daysToShow
            if (daysUntilDue >= 0 && daysUntilDue <= daysToShow) {
                let message = "";
                let urgency = "normal";

                if (daysUntilDue === 0) {
                    message = `${bill.name} is due today`;
                    urgency = "urgent"; // Keep urgency for styling only
                } else if (daysUntilDue === 1) {
                    message = `${bill.name} is due tomorrow`;
                    urgency = "high"; // Keep urgency for styling only
                } else {
                    message = `${bill.name} is due in ${daysUntilDue} days`;
                    urgency = "normal";
                }

                const nextDueDate = getNextPaymentDate(
                    billingStartDate,
                    bill.interval
                );

                const notificationData = {
                    id: bill.id, // Use bill ID as notification ID
                    title: "Bill Reminder",
                    message: message,
                    urgency: urgency,
                    dueDate: nextDueDate,
                    dueDateRaw: getNextPaymentDateRaw(
                        billingStartDate,
                        bill.interval
                    ),
                    billName: bill.name,
                    billId: bill.id,
                    userId: user.uid,
                    createdAt: new Date(),
                    type: "bill_reminder",
                };

                notifications.push(notificationData);
            }
        }

        return notifications;
    };

    const getDaysUntilDue = (billingStartDate, interval) => {
        if (!billingStartDate || !interval) return 999;

        const intervalData = intervalOptions.find(
            (opt) => opt.value === interval
        );
        if (!intervalData) return 999;

        // Get today's date with time set to 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate next payment date based on billing start date
        const startDate = new Date(billingStartDate);

        // Find the next occurrence from the billing start date
        // by adding interval days until we reach a date >= today
        const intervalDays = intervalData.days;
        let nextDate = new Date(startDate);

        // If the billing start date is today or in the future, that's the next due date
        if (nextDate >= today) {
            const timeDiff = nextDate.getTime() - today.getTime();
            return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        }

        // Otherwise, keep adding interval days until we reach a future date
        while (nextDate < today) {
            nextDate.setDate(nextDate.getDate() + intervalDays);
        }

        // Calculate days until the next payment
        const timeDiff = nextDate.getTime() - today.getTime();
        return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    };

    const getNextPaymentDate = (billingStartDate, interval) => {
        if (!billingStartDate || !interval) return "Invalid date";

        const intervalData = intervalOptions.find(
            (opt) => opt.value === interval
        );
        if (!intervalData) return "Invalid date";

        // Get today's date with time set to 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate next payment date based on billing start date
        const startDate = new Date(billingStartDate);

        // Find the next occurrence from the billing start date
        // by adding interval days until we reach a date >= today
        const intervalDays = intervalData.days;
        let nextDate = new Date(startDate);

        // If the billing start date is today or in the future, that's the next due date
        if (nextDate >= today) {
            // Use this date
        }
        // Otherwise, keep adding interval days until we reach a future date
        else {
            while (nextDate < today) {
                nextDate.setDate(nextDate.getDate() + intervalDays);
            }
        }

        return nextDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getUrgencyStyle = (urgency) => {
        switch (urgency) {
            case "urgent":
                return "border-yellow-500 bg-yellow-500/10"; // Today - yellow
            case "high":
                return "border-yellow-300 bg-yellow-300/5"; // Tomorrow - lighter yellow
            default:
                return "border-white/30 bg-zinc-900"; // Further in future - default
        }
    };

    const getUrgencyTextColor = (urgency) => {
        return "text-white"; // Use white text for all notifications
    };

    const getNextPaymentDateRaw = (billingStartDate, interval) => {
        if (!billingStartDate || !interval) return null;

        const intervalData = intervalOptions.find(
            (opt) => opt.value === interval
        );
        if (!intervalData) return null;

        // Get today's date with time set to 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate next payment date based on billing start date
        const startDate = new Date(billingStartDate);

        // Find the next occurrence from the billing start date
        // by adding interval days until we reach a date >= today
        const intervalDays = intervalData.days;
        let nextDate = new Date(startDate);

        // If the billing start date is today or in the future, that's the next due date
        if (nextDate >= today) {
            // Use this date
        }
        // Otherwise, keep adding interval days until we reach a future date
        else {
            while (nextDate < today) {
                nextDate.setDate(nextDate.getDate() + intervalDays);
            }
        }

        return nextDate;
    };

    const handleDismissNotification = (notificationId) => {
        // Since notifications are generated on-the-fly and not stored in Firestore,
        // we just need to remove it from the local state
        setNotifications(
            notifications.filter((notif) => notif.id !== notificationId)
        );
    };

    const handleRefreshNotifications = () => {
        setLoading(true);
        loadBillsAndGenerateNotifications();
    };

    const formatDate = (date) => {
        if (!date) return "";
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div
                className={`fixed top-0 left-0 right-0 z-30 md:hidden flex items-center h-12 px-4 py-7 transition-colors duration-300 bg-[#1B1C21]`}
            >
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <main className="w-full md:ml-[20%] flex-1 flex flex-col min-h-screen px-4 md:px-14 py-10 mt-16 md:mt-0 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-0">
                        Notifications
                    </h1>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center">
                            <label
                                htmlFor="daysToShow"
                                className="text-white mr-2 text-sm"
                            >
                                Show bills due within:
                            </label>
                            <select
                                id="daysToShow"
                                value={daysToShow}
                                onChange={(e) => {
                                    setDaysToShow(Number(e.target.value));
                                    loadBillsAndGenerateNotifications();
                                }}
                                className="bg-zinc-800 text-white border border-white/30 rounded px-3 py-1 text-sm cursor-pointer"
                            >
                                <option value="7">1 week</option>
                                <option value="30">1 month</option>
                            </select>
                        </div>
                        <button
                            onClick={handleRefreshNotifications}
                            className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                        <p className="text-gray-400">
                            Loading notifications...
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                        <p className="text-gray-400 text-lg">
                            No upcoming bills in the next {daysToShow} day
                            {daysToShow > 1 ? "s" : ""}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Try increasing the time range or add new recurring
                            bills
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 md:gap-5">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`border rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col shadow ${getUrgencyStyle(
                                    notif.urgency
                                )}`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`font-bold text-base md:text-lg ${getUrgencyTextColor(
                                                    notif.urgency
                                                )}`}
                                            >
                                                {notif.title}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm md:text-base mt-1">
                                            {notif.message}
                                        </p>
                                        {notif.dueDate && (
                                            <p className="text-gray-400 text-xs md:text-sm mt-1">
                                                Due: {notif.dueDate}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 md:mt-0 md:ml-6">
                                        <button
                                            onClick={() =>
                                                handleDismissNotification(
                                                    notif.id
                                                )
                                            }
                                            className="text-gray-400 hover:text-yellow-400 text-sm font-medium transition cursor-pointer"
                                        >
                                            Hide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
