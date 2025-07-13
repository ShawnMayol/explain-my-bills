import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where, 
    orderBy 
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadBillsAndGenerateNotifications();
        }
    }, [user]);

    const loadBillsAndGenerateNotifications = async () => {
        try {
            const billsRef = collection(db, "bills");
            const q = query(
                billsRef, 
                where("userId", "==", user.uid),
                orderBy("name", "asc")
            );
            const querySnapshot = await getDocs(q);
            const billsData = [];
            querySnapshot.forEach((doc) => {
                billsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setBills(billsData);

            const notifsRef = collection(db, "notifications");
            const notifsQuery = query(
                notifsRef, 
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const notifsSnapshot = await getDocs(notifsQuery);
            const existingNotifs = [];
            notifsSnapshot.forEach((doc) => {
                existingNotifs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            const newNotifications = await generateBillNotifications(billsData, existingNotifs);
            
            const allNotifs = [...existingNotifs, ...newNotifications].sort((a, b) => {
                const urgencyOrder = { urgent: 3, high: 2, normal: 1 };
                if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                }
                return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
            });

            setNotifications(allNotifs);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateBillNotifications = async (billsData, existingNotifs) => {
        const today = new Date();
        const newNotifs = [];

        for (const bill of billsData) {
            const daysUntilDue = getDaysUntilDue(bill.dayOfMonth);
            
            if (daysUntilDue <= 7 && daysUntilDue >= 0) {
                const todayStr = today.toDateString();
                const existingNotif = existingNotifs.find(notif => 
                    notif.billId === bill.id && 
                    new Date(notif.createdAt?.toDate?.() || notif.createdAt).toDateString() === todayStr
                );

                if (!existingNotif) {
                    let message = "";
                    let urgency = "normal";

                    if (daysUntilDue === 0) {
                        message = `${bill.name} is due today!`;
                        urgency = "urgent";
                    } else if (daysUntilDue === 1) {
                        message = `${bill.name} is due tomorrow.`;
                        urgency = "high";
                    } else {
                        message = `${bill.name} is due in ${daysUntilDue} days.`;
                        urgency = "normal";
                    }

                    const nextDueDate = getNextBillDate(bill.dayOfMonth);
                    
                    const notificationData = {
                        title: "Bill Reminder",
                        message: message,
                        urgency: urgency,
                        dueDate: nextDueDate,
                        billName: bill.name,
                        billId: bill.id,
                        userId: user.uid,
                        createdAt: new Date(),
                        type: "bill_reminder"
                    };

                    try {
                        const docRef = await addDoc(collection(db, "notifications"), notificationData);
                        newNotifs.push({
                            id: docRef.id,
                            ...notificationData
                        });
                    } catch (error) {
                        console.error("Error saving notification:", error);
                    }
                }
            }
        }

        return newNotifs;
    };

    const getDaysUntilDue = (dayOfMonth) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();
        
        let targetMonth = currentMonth;
        let targetYear = currentYear;
        
        if (dayOfMonth < currentDay) {
            targetMonth = currentMonth + 1;
            if (targetMonth > 11) {
                targetMonth = 0;
                targetYear = currentYear + 1;
            }
        }
        
        const dueDate = new Date(targetYear, targetMonth, dayOfMonth);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff;
    };

    const getNextBillDate = (dayOfMonth) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();
        
        let nextMonth = currentMonth;
        let nextYear = currentYear;
        
        if (dayOfMonth <= currentDay) {
            nextMonth = currentMonth + 1;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear = currentYear + 1;
            }
        }
        
        const nextBillDate = new Date(nextYear, nextMonth, dayOfMonth);
        return nextBillDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getUrgencyStyle = (urgency) => {
        switch (urgency) {
            case 'urgent':
                return 'border-red-500 bg-red-500/10';
            case 'high':
                return 'border-orange-500 bg-orange-500/10';
            default:
                return 'border-white/30 bg-zinc-900';
        }
    };

    const getUrgencyTextColor = (urgency) => {
        switch (urgency) {
            case 'urgent':
                return 'text-red-400';
            case 'high':
                return 'text-orange-400';
            default:
                return 'text-white';
        }
    };

    const handleDismissNotification = async (notificationId) => {
        try {
            await deleteDoc(doc(db, "notifications", notificationId));
            setNotifications(notifications.filter(notif => notif.id !== notificationId));
        } catch (error) {
            console.error("Error dismissing notification:", error);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

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
                
                {loading ? (
                    <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                        <p className="text-gray-400">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                        <p className="text-gray-400 text-lg">No notifications at the moment</p>
                        <p className="text-gray-500 text-sm mt-2">You'll be notified when bills are due soon</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 md:gap-5">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`border rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col shadow ${getUrgencyStyle(notif.urgency)}`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold text-base md:text-lg ${getUrgencyTextColor(notif.urgency)}`}>
                                                {notif.title}
                                            </span>
                                            {notif.urgency === 'urgent' && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                    URGENT
                                                </span>
                                            )}
                                            {notif.urgency === 'high' && (
                                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                    HIGH
                                                </span>
                                            )}
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
                                        <div className="text-xs text-gray-400 min-w-[80px] text-left md:text-right">
                                            {formatDate(notif.createdAt)}
                                        </div>
                                        <button
                                            onClick={() => handleDismissNotification(notif.id)}
                                            className="text-gray-400 hover:text-red-400 text-sm font-medium transition"
                                        >
                                            Dismiss
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