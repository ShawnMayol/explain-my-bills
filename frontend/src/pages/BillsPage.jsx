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
    where, 
    orderBy 
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function BillsPage() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        dayOfMonth: "",
    });

    useEffect(() => {
        if (user) {
            loadBills();
        }
    }, [user]);

    const loadBills = async () => {
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
        } catch (error) {
            console.error("Error loading bills:", error);
        } finally {
            setLoading(false);
        }
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
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleAddBill = () => {
        setFormData({ name: "", dayOfMonth: "" });
        setEditingBill(null);
        setShowAddModal(true);
    };

    const handleEditBill = (bill) => {
        setFormData({
            name: bill.name,
            dayOfMonth: bill.dayOfMonth.toString(),
        });
        setEditingBill(bill);
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.dayOfMonth) return;

        const dayOfMonth = parseInt(formData.dayOfMonth);
        if (dayOfMonth < 1 || dayOfMonth > 31) return;

        try {
            if (editingBill) {
                const billRef = doc(db, "bills", editingBill.id);
                await updateDoc(billRef, {
                    name: formData.name.trim(),
                    dayOfMonth: dayOfMonth,
                    updatedAt: new Date()
                });
            } else {
                await addDoc(collection(db, "bills"), {
                    name: formData.name.trim(),
                    dayOfMonth: dayOfMonth,
                    userId: user.uid,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            await loadBills();
            setShowAddModal(false);
            setFormData({ name: "", dayOfMonth: "" });
            setEditingBill(null);
        } catch (error) {
            console.error("Error saving bill:", error);
        }
    };

    const handleDeleteBill = async (billId) => {
        try {
            await deleteDoc(doc(db, "bills", billId));
            await loadBills();
        } catch (error) {
            console.error("Error deleting bill:", error);
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setFormData({ name: "", dayOfMonth: "" });
        setEditingBill(null);
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
                <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">Bills</h1>

                <div className="bg-zinc-900 border border-white/30 rounded-xl h-36 md:h-48 flex items-center justify-center mb-6 md:mb-10">
                    <span className="text-gray-400 font-bold text-base md:text-lg select-none text-center px-4">
                        Calendar for Recurring Bills
                    </span>
                </div>

                <div className="flex flex-col gap-4 md:gap-5">
                    {loading ? (
                        <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                            <p className="text-gray-400">Loading bills...</p>
                        </div>
                    ) : bills.length === 0 ? (
                        <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
                            <p className="text-gray-400 text-lg">No bills added yet</p>
                            <p className="text-gray-500 text-sm mt-2">Click "Add Recurring Bill" to get started</p>
                        </div>
                    ) : (
                        bills.map((bill) => (
                            <div
                                key={bill.id}
                                className="bg-zinc-900 border border-white/30 rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between shadow"
                            >
                                <div className="flex-1">
                                    <span className="font-bold text-white text-base md:text-lg">
                                        {bill.name}
                                    </span>
                                    <p className="text-gray-300 text-sm md:text-base mt-1">
                                        Next Bill Date: {getNextBillDate(bill.dayOfMonth)}
                                    </p>
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">
                                        Due on day {bill.dayOfMonth} of each month
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4 md:mt-0">
                                    <button 
                                        onClick={() => handleEditBill(bill)}
                                        className="border-2 border-yellow-300 text-yellow-300 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBill(bill.id)}
                                        className="border-2 border-red-500 text-red-500 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-red-500 hover:text-white transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-center md:justify-end mt-8 md:mt-12">
                    <button 
                        onClick={handleAddBill}
                        className="border-2 border-yellow-300 text-yellow-300 bg-zinc-900 rounded-full px-6 md:px-8 py-2 md:py-3 text-lg md:text-xl font-bold hover:bg-yellow-300 hover:text-black transition shadow"
                    >
                        + Add Recurring Bill
                    </button>
                </div>
            </main>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/30 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-white">
                            {editingBill ? 'Edit Bill' : 'Add New Bill'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Bill Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-600 rounded-lg p-3 bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    placeholder="Enter bill name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Day of Month (1-31)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.dayOfMonth}
                                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                                    className="w-full border border-gray-600 rounded-lg p-3 bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    placeholder="Enter day of month"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 border-2 border-gray-500 text-gray-300 rounded-lg py-2 font-medium hover:bg-gray-500 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 border-2 border-yellow-300 text-yellow-300 rounded-lg py-2 font-medium hover:bg-yellow-300 hover:text-black transition"
                                >
                                    {editingBill ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}