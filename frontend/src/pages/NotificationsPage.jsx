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

// Toast component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 border-green-500';
            case 'error':
                return 'bg-red-600 border-red-500';
            case 'warning':
                return 'bg-yellow-600 border-yellow-500';
            default:
                return 'bg-blue-600 border-blue-500';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 border-l-4 rounded-lg p-4 shadow-lg text-white max-w-md ${getToastStyle()}`}>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200 font-bold"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);

    const intervalOptions = [
        { value: "Weekly", label: "Weekly", days: 7 },
        { value: "Monthly", label: "Monthly", days: 30 },
        { value: "Bi-Annually", label: "Bi-Annually", days: 182 },
        { value: "Annually", label: "Annually", days: 365 }
    ];

    useEffect(() => {
        if (user) {
            loadBillsAndGenerateNotifications();
        }
    }, [user]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

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
            
            if (newNotifications.length > 0) {
                showToast(`Generated ${newNotifications.length} new notification(s)`, 'success');
            }
        } catch (error) {
            console.error("Error loading data:", error);
            showToast("Error loading notifications", 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateBillNotifications = async (billsData, existingNotifs) => {
        const today = new Date();
        const newNotifs = [];

        for (const bill of billsData) {
            const daysUntilDue = getDaysUntilDue(bill.lastPaymentDate, bill.interval);
            
            if (daysUntilDue <= 7 && daysUntilDue >= -1) { // Include 1 day overdue
                const todayStr = today.toDateString();
                const existingNotif = existingNotifs.find(notif => 
                    notif.billId === bill.id && 
                    new Date(notif.createdAt?.toDate?.() || notif.createdAt).toDateString() === todayStr
                );

                if (!existingNotif) {
                    let message = "";
                    let urgency = "normal";

                    if (daysUntilDue < 0) {
                        const daysOverdue = Math.abs(daysUntilDue);
                        message = `${bill.name} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`;
                        urgency = "urgent";
                    } else if (daysUntilDue === 0) {
                        message = `${bill.name} is due today!`;
                        urgency = "urgent";
                    } else if (daysUntilDue === 1) {
                        message = `${bill.name} is due tomorrow.`;
                        urgency = "high";
                    } else {
                        message = `${bill.name} is due in ${daysUntilDue} days.`;
                        urgency = "normal";
                    }

                    const nextDueDate = getNextPaymentDate(bill.lastPaymentDate, bill.interval);
                    
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
                        showToast("Error saving notification", 'error');
                    }
                }
            }
        }

        return newNotifs;
    };

    const getDaysUntilDue = (lastPaymentDate, interval) => {
        if (!lastPaymentDate || !interval) return 999;
        
        const intervalData = intervalOptions.find(opt => opt.value === interval);
        if (!intervalData) return 999;

        const lastDate = new Date(lastPaymentDate);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + intervalData.days);
        
        const today = new Date();
        const timeDiff = nextDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        return daysDiff;
    };

    const getNextPaymentDate = (lastPaymentDate, interval) => {
        if (!lastPaymentDate || !interval) return "Invalid date";
        
        const intervalData = intervalOptions.find(opt => opt.value === interval);
        if (!intervalData) return "Invalid date";

        const lastDate = new Date(lastPaymentDate);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + intervalData.days);

        return nextDate.toLocaleDateString('en-US', {
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
            showToast("Notification dismissed", 'success');
        } catch (error) {
            console.error("Error dismissing notification:", error);
            showToast("Error dismissing notification", 'error');
        }
    };

    const handleRefreshNotifications = () => {
        setLoading(true);
        loadBillsAndGenerateNotifications();
        showToast("Refreshing notifications...", 'info');
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-0">
                        Notifications
                    </h1>
                    <button
                        onClick={handleRefreshNotifications}
                        className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                
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

            {/* Toast container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </div>
    );
}