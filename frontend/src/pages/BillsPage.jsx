import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";
import toast from "react-hot-toast";
import {
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    DialogActions,
    Button,
} from "@mui/material";

export default function BillsPage() {
    // Get the current user from AuthContext
    const { user } = useAuth();
    // Sidebar open/close state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // List of bills
    const [bills, setBills] = useState([]);
    // Loading state for bills
    const [loading, setLoading] = useState(true);
    // Modal state for adding/editing bills
    const [showAddModal, setShowAddModal] = useState(false);
    // Bill being edited (null if adding new)
    const [editingBill, setEditingBill] = useState(null);
    // Form data for bill add/edit
    const [formData, setFormData] = useState({
        name: "",
        interval: "Monthly",
        billingStart: "",
    });
    // Calendar date for navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    // Event detail modal
    const [selectedEvent, setSelectedEvent] = useState(null);
    // Pagination for bills list
    const [page, setPage] = useState(1);
    const billsPerPage = 5;
    // Day events modal
    const [dayEventsModalOpen, setDayEventsModalOpen] = useState(false);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [dayEventsPage, setDayEventsPage] = useState(1);
    const eventsPerPage = 5;
    // Selected day for events modal
    const [selectedDay, setSelectedDay] = useState(null);

    // Set up moment localizer for the calendar
    const localizer = momentLocalizer(moment);

    // Options for bill payment intervals
    const intervalOptions = [
        { value: "Weekly", label: "Weekly", days: 7 },
        { value: "Monthly", label: "Monthly", days: 30 },
        { value: "Bi-Annually", label: "Bi-Annually", days: 182 },
        { value: "Annually", label: "Annually", days: 365 },
    ];

    // Load bills when user changes
    useEffect(() => {
        if (user) {
            loadBills();
        }
    }, [user]);

    // Fetch bills from Firestore for the current user
    const loadBills = async () => {
        try {
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
        } catch (error) {
            console.error("Error loading bills:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format a date string to a readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    // Calculate days until the next payment
    const getDaysUntilNext = (billingStart, interval) => {
        const intervalData = intervalOptions.find(
            (opt) => opt.value === interval
        );
        if (!intervalData || !billingStart) return 0;
        const lastDate = new Date(billingStart);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + intervalData.days);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day

        // Use consistent calculation method with generateEvents
        const timeDiff = nextDate.getTime() - today.getTime();
        const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        return diffDays;
    }; // Open the modal to add a new bill
    const handleAddBill = () => {
        setFormData({ name: "", interval: "Monthly", billingStart: "" });
        setEditingBill(null);
        setShowAddModal(true);
    };

    // Open the modal to edit an existing bill
    const handleEditBill = (bill) => {
        // Handle existing records that use lastPaymentDate field
        const billingStartValue = bill.billingStart || bill.lastPaymentDate;

        setFormData({
            name: bill.name,
            interval: bill.interval,
            billingStart: billingStartValue,
        });
        setEditingBill(bill);
        setShowAddModal(true);
    };

    // Handle form submission for adding or editing a bill
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !formData.name.trim() ||
            !formData.interval ||
            !formData.billingStart
        )
            return;
        try {
            if (editingBill) {
                // Update existing bill
                const billRef = doc(
                    db,
                    "users",
                    user.uid,
                    "billsRecurring",
                    editingBill.id
                );
                await updateDoc(billRef, {
                    name: formData.name.trim(),
                    interval: formData.interval,
                    billingStart: formData.billingStart,
                    // Keep lastPaymentDate for backward compatibility,
                    // but this will be phased out in future
                    lastPaymentDate: formData.billingStart,
                    updatedAt: new Date(),
                });
                // Show success toast for updating bill
                toast.success(
                    `Bill "${formData.name.trim()}" was updated successfully`
                );
            } else {
                // Add new bill
                await addDoc(
                    collection(db, "users", user.uid, "billsRecurring"),
                    {
                        name: formData.name.trim(),
                        interval: formData.interval,
                        billingStart: formData.billingStart,
                        // Keep lastPaymentDate for backward compatibility
                        lastPaymentDate: formData.billingStart,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                );
                // Show success toast for adding new bill
                toast.success(
                    `Bill "${formData.name.trim()}" was added successfully`
                );
            }
            await loadBills();
            setShowAddModal(false);
            setFormData({ name: "", interval: "Monthly", billingStart: "" });
            setEditingBill(null);
        } catch (error) {
            console.error("Error saving bill:", error);
            // Show error toast
            toast.error(`Error: ${error.message || "Failed to save bill"}`);
        }
    };

    // Delete a bill by ID
    const handleDeleteBill = async (billId) => {
        try {
            // Find the bill name before deleting to use in notification
            const billToDelete = bills.find((bill) => bill.id === billId);
            const billName = billToDelete ? billToDelete.name : "Bill";

            await deleteDoc(
                doc(db, "users", user.uid, "billsRecurring", billId)
            );
            await loadBills();

            // Show success toast
            toast.success(`"${billName}" was deleted successfully`);
        } catch (error) {
            console.error("Error deleting bill:", error);
            // Show error toast
            toast.error(`Error: ${error.message || "Failed to delete bill"}`);
        }
    };

    // Close the add/edit modal and reset form
    const closeModal = () => {
        setShowAddModal(false);
        setFormData({ name: "", interval: "Monthly", billingStart: "" });
        setEditingBill(null);
    };

    // Generate calendar events from bills data
    const generateEvents = () => {
        const events = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day for accurate comparison

        bills.forEach((bill) => {
            // Support both new and old field name
            const billingStartDate = bill.billingStart || bill.lastPaymentDate;
            const lastDate = new Date(billingStartDate);
            const intervalData = intervalOptions.find(
                (i) => i.value === bill.interval
            );

            if (!intervalData || !billingStartDate) return;

            // Generate payments starting from the last payment date
            // We'll generate 12 events forward from the last payment date
            for (let i = 0; i < 12; i++) {
                const paymentDate = new Date(lastDate);
                paymentDate.setDate(
                    paymentDate.getDate() + intervalData.days * i
                );

                // Check if this date is in the past or future
                const isPast = paymentDate < today;

                // Calculate days until this payment (for due soon logic)
                // Adjust calculation to fix off-by-one issue
                const timeDiff = paymentDate.getTime() - today.getTime();
                const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                events.push({
                    id: `${bill.id}-payment-${i}`,
                    title: bill.name,
                    start: new Date(paymentDate),
                    end: new Date(paymentDate),
                    allDay: true,
                    isPast: isPast,
                    isDueSoon: !isPast && daysUntil <= 3 && daysUntil >= 0,
                    daysUntil: daysUntil,
                    bill: bill,
                });
            }
        });

        return events;
    };

    // Handle calendar event click
    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    // Close event detail modal
    const closeEventDetail = () => {
        setSelectedEvent(null);
    };

    // Handle selecting a day in the calendar
    const handleSelectSlot = (slotInfo) => {
        const selectedDate = slotInfo.start;
        // Format date to compare with event dates
        const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

        // Find all events for this day
        const eventsForDay = generateEvents().filter(
            (event) =>
                moment(event.start).format("YYYY-MM-DD") === formattedDate
        );

        if (eventsForDay.length > 0) {
            setSelectedDay(selectedDate);
            setSelectedDayEvents(eventsForDay);
            setDayEventsPage(1);
            setDayEventsModalOpen(true);
        }
    };

    // Close day events modal
    const closeDayEventsModal = () => {
        setDayEventsModalOpen(false);
        setSelectedDayEvents([]);
        setSelectedDay(null);
    };

    // Calculate the total number of pages for bills pagination
    const totalBillPages = Math.ceil(bills.length / billsPerPage);

    // Calculate the total number of pages for day events pagination
    const totalDayEventPages = Math.ceil(
        selectedDayEvents.length / eventsPerPage
    );

    // Handle page change for bills pagination
    const handleBillPageChange = (event, value) => {
        setPage(value);
    };

    // Handle page change for day events pagination
    const handleDayEventPageChange = (event, value) => {
        setDayEventsPage(value);
    };

    // Render the main UI
    return (
        <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
            {/* Sidebar navigation */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile menu button */}
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

            {/* Main content */}
            <main className="w-full md:ml-[20%] flex-1 flex flex-col min-h-screen px-4 md:px-14 py-10 mt-16 md:mt-0 overflow-y-auto">
                <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">
                    Bills
                </h1>

                {/* Calendar */}
                <div className="bg-zinc-900 border border-white/30 rounded-xl p-4 mb-6 md:mb-10">
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <span className="text-gray-400 font-bold">
                                Loading calendar...
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-yellow-300">
                                    Recurring Bills Calendar
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            const date = new Date(currentDate);
                                            date.setMonth(date.getMonth() - 1);
                                            setCurrentDate(date);
                                        }}
                                        className="p-2 hover:bg-zinc-800 rounded-full transition text-gray-300 hover:text-white cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </button>
                                    <div className="text-lg font-medium text-white">
                                        {moment(currentDate).format(
                                            "MMMM YYYY"
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const date = new Date(currentDate);
                                            date.setMonth(date.getMonth() + 1);
                                            setCurrentDate(date);
                                        }}
                                        className="p-2 hover:bg-zinc-800 rounded-full transition text-gray-300 hover:text-white cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div
                                className="calendar-container"
                                style={{ height: 400 }}
                            >
                                <Calendar
                                    localizer={localizer}
                                    events={generateEvents()}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: "100%" }}
                                    views={["month"]}
                                    view="month"
                                    date={currentDate}
                                    onNavigate={(date) => setCurrentDate(date)}
                                    toolbar={false}
                                    onSelectEvent={handleEventClick}
                                    onSelectSlot={handleSelectSlot}
                                    selectable={true}
                                    eventPropGetter={(event) => ({
                                        style: {
                                            backgroundColor: event.isDueSoon
                                                ? "#f59e0b"
                                                : event.isPast
                                                ? "#6b7280"
                                                : "#3b82f6",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                        },
                                    })}
                                    dayPropGetter={(date) => {
                                        // Get formatted date to match with events
                                        const formattedDate =
                                            moment(date).format("YYYY-MM-DD");

                                        // Find events for this day
                                        const eventsForDay =
                                            generateEvents().filter(
                                                (event) =>
                                                    moment(event.start).format(
                                                        "YYYY-MM-DD"
                                                    ) === formattedDate
                                            );

                                        // Return style with pointer cursor if has events
                                        if (eventsForDay.length > 0) {
                                            return {
                                                style: {
                                                    cursor: "pointer",
                                                },
                                            };
                                        }
                                        return {};
                                    }}
                                />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                                    <span>Upcoming</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
                                    <span>Due Soon</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#6b7280] mr-2"></div>
                                    <span>Past Payments</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Bills list */}
                <div className="flex flex-col gap-4 md:gap-5">
                    {loading ? (
                        <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                            <p className="text-gray-400">Loading bills...</p>
                        </div>
                    ) : bills.length === 0 ? (
                        <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                            <p className="text-gray-400 text-lg">
                                No bills added yet
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                Click "Add Recurring Bill" to get started
                            </p>
                        </div>
                    ) : (
                        <>
                            {bills
                                .slice(
                                    (page - 1) * billsPerPage,
                                    page * billsPerPage
                                )
                                .map((bill) => {
                                    const daysUntilNext = getDaysUntilNext(
                                        bill.billingStart ||
                                            bill.lastPaymentDate,
                                        bill.interval
                                    );
                                    const isDueSoon =
                                        daysUntilNext <= 3 &&
                                        daysUntilNext >= 0;

                                    return (
                                        <div
                                            key={bill.id}
                                            className={`bg-zinc-900 border rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between shadow ${
                                                isDueSoon
                                                    ? "border-yellow-500/50 bg-yellow-900/20"
                                                    : "border-white/30"
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-white text-base md:text-lg">
                                                        {bill.name}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${
                                                            isDueSoon
                                                                ? "bg-yellow-500 text-black"
                                                                : "bg-gray-600 text-gray-300"
                                                        }`}
                                                    >
                                                        {bill.interval}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-sm md:text-base">
                                                    Billing Start:{" "}
                                                    {formatDate(
                                                        bill.billingStart ||
                                                            bill.lastPaymentDate
                                                    )}
                                                </p>
                                                
                                            </div>
                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                <button
                                                    onClick={() =>
                                                        handleEditBill(bill)
                                                    }
                                                    className="border-2 border-yellow-300 text-yellow-300 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteBill(
                                                            bill.id
                                                        )
                                                    }
                                                    className="border-2 border-red-500 text-red-500 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-red-500 hover:text-white transition cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* Pagination for bills list */}
                            {bills.length > billsPerPage && (
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        count={totalBillPages}
                                        page={page}
                                        onChange={handleBillPageChange}
                                        sx={{
                                            "& .MuiPaginationItem-root": {
                                                color: "#fff",
                                            },
                                            "& .Mui-selected": {
                                                backgroundColor:
                                                    "rgba(250, 204, 21, 0.2) !important",
                                                color: "#facc15",
                                            },
                                            "& .MuiPaginationItem-icon": {
                                                color: "#fff",
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Add Recurring Bill button */}
                <div className="flex justify-center md:justify-end mt-8 md:mt-12">
                    <button
                        onClick={handleAddBill}
                        className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-6 md:px-8 py-2 md:py-3 text-lg md:text-xl font-bold hover:bg-yellow-300 hover:text-black transition shadow cursor-pointer"
                    >
                        + Add Recurring Bill
                    </button>
                </div>
            </main>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/30 rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">
                                {selectedEvent.title}
                            </h2>
                            <div
                                className={`px-2 py-1 text-xs rounded-full ${
                                    selectedEvent.isDueSoon
                                        ? "bg-yellow-500 text-black"
                                        : selectedEvent.isPast
                                        ? "bg-gray-600 text-white"
                                        : "bg-blue-500 text-white"
                                }`}
                            >
                                {selectedEvent.isDueSoon
                                    ? "Due Soon"
                                    : selectedEvent.isPast
                                    ? "Past Payment"
                                    : "Upcoming"}
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div>
                                <p className="text-gray-400 text-sm">
                                    Payment Date
                                </p>
                                <p className="text-white">
                                    {moment(selectedEvent.start).format(
                                        "MMMM D, YYYY"
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">
                                    Payment Interval
                                </p>
                                <p className="text-white">
                                    {selectedEvent.bill?.interval || "N/A"}
                                </p>
                            </div>

                            {selectedEvent.isDueSoon && (
                                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                                    <p className="text-yellow-400 font-medium">
                                        {selectedEvent.daysUntil === 0
                                            ? "This payment is due today"
                                            : selectedEvent.daysUntil === 1
                                            ? "This payment is due tomorrow"
                                            : `This payment is due in ${selectedEvent.daysUntil} days`}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeEventDetail}
                                className="flex-1 border-2 border-gray-500 text-gray-300 rounded-lg py-2 font-medium hover:bg-gray-500 hover:text-white transition cursor-pointer"
                            >
                                Close
                            </button>
                            {!selectedEvent.isPast && (
                                <button
                                    onClick={() => {
                                        if (selectedEvent.bill) {
                                            handleEditBill(selectedEvent.bill);
                                            closeEventDetail();
                                        }
                                    }}
                                    className="flex-1 border-2 border-yellow-300 text-yellow-300 rounded-lg py-2 font-medium hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                                >
                                    Edit Bill
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/30 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-white">
                            {editingBill ? "Edit Bill" : "Add New Bill"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Bill Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-600 rounded-lg p-3 bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    placeholder="Enter bill name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Payment Interval
                                </label>
                                <select
                                    value={formData.interval}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            interval: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-600 rounded-lg p-3 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                                    required
                                >
                                    {intervalOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Billing Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.billingStart}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            billingStart: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-600 rounded-lg p-3 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 border-2 border-gray-500 text-gray-300 rounded-lg py-2 font-medium hover:bg-gray-500 hover:text-white transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 border-2 border-yellow-300 text-yellow-300 rounded-lg py-2 font-medium hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                                >
                                    {editingBill ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Day Events Modal */}
            <Dialog
                open={dayEventsModalOpen}
                onClose={closeDayEventsModal}
                PaperProps={{
                    style: {
                        backgroundColor: "#1B1C21",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "12px",
                        maxWidth: "500px",
                        width: "100%",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        padding: "16px 24px",
                    }}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-yellow-300">
                            Bills Due on{" "}
                            {selectedDay &&
                                moment(selectedDay).format("MMMM D, YYYY")}
                        </span>
                    </div>
                </DialogTitle>
                <DialogContent sx={{ padding: "20px 24px" }}>
                    {selectedDayEvents.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-400">
                                No bills due on this day
                            </p>
                        </div>
                    ) : (
                        <>
                            <List sx={{ padding: 0 }}>
                                {selectedDayEvents
                                    .slice(
                                        (dayEventsPage - 1) * eventsPerPage,
                                        dayEventsPage * eventsPerPage
                                    )
                                    .map((event) => (
                                        <ListItem
                                            key={event.id}
                                            sx={{
                                                borderBottom:
                                                    "1px solid rgba(255, 255, 255, 0.1)",
                                                padding: "12px 0",
                                                "&:last-child": {
                                                    borderBottom: "none",
                                                },
                                            }}
                                            secondaryAction={
                                                !event.isPast && (
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => {
                                                            if (event.bill) {
                                                                handleEditBill(
                                                                    event.bill
                                                                );
                                                                closeDayEventsModal();
                                                            }
                                                        }}
                                                        sx={{
                                                            color: "#facc15",
                                                            borderColor:
                                                                "#facc15",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#facc15",
                                                                color: "black",
                                                                borderColor:
                                                                    "#facc15",
                                                            },
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                )
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">
                                                            {event.title}
                                                        </span>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${
                                                                event.isDueSoon
                                                                    ? "bg-yellow-500 text-black"
                                                                    : event.isPast
                                                                    ? "bg-gray-600 text-white"
                                                                    : "bg-blue-500 text-white"
                                                            }`}
                                                        >
                                                            {event.isDueSoon
                                                                ? "Due Soon"
                                                                : event.isPast
                                                                ? "Past Payment"
                                                                : "Upcoming"}
                                                        </span>
                                                    </div>
                                                }
                                                secondary={
                                                    <div className="mt-1 text-gray-400">
                                                        {event.bill?.interval ||
                                                            "N/A"}
                                                        {event.isDueSoon && (
                                                            <span className="ml-2 text-yellow-500 font-medium">
                                                                {event.daysUntil ===
                                                                0
                                                                    ? "(Due today)"
                                                                    : event.daysUntil ===
                                                                      1
                                                                    ? "(Due tomorrow)"
                                                                    : `(Due in ${event.daysUntil} days)`}
                                                            </span>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                            </List>

                            {/* Pagination for day events */}
                            {selectedDayEvents.length > eventsPerPage && (
                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        count={totalDayEventPages}
                                        page={dayEventsPage}
                                        onChange={handleDayEventPageChange}
                                        size="small"
                                        sx={{
                                            "& .MuiPaginationItem-root": {
                                                color: "#fff",
                                            },
                                            "& .Mui-selected": {
                                                backgroundColor:
                                                    "rgba(250, 204, 21, 0.2) !important",
                                                color: "#facc15",
                                            },
                                            "& .MuiPaginationItem-icon": {
                                                color: "#fff",
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        padding: "12px 24px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <Button
                        onClick={closeDayEventsModal}
                        sx={{
                            color: "#fff",
                            backgroundColor: "rgba(107, 114, 128, 0.3)",
                            "&:hover": {
                                backgroundColor: "rgba(107, 114, 128, 0.5)",
                            },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
