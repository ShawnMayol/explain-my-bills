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
    lastPaymentDate: "",
  });

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
      const billsRef = collection(db, "users", user.uid, "bills");
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

  // Calculate the next payment date for a bill
  const getNextPaymentDate = (lastPaymentDate, interval) => {
    const intervalData = intervalOptions.find((opt) => opt.value === interval);
    if (!intervalData || !lastPaymentDate) return "Invalid date";
    const lastDate = new Date(lastPaymentDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + intervalData.days);
    return nextDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
  const getDaysUntilNext = (lastPaymentDate, interval) => {
    const intervalData = intervalOptions.find((opt) => opt.value === interval);
    if (!intervalData || !lastPaymentDate) return 0;
    const lastDate = new Date(lastPaymentDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + intervalData.days);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Open the modal to add a new bill
  const handleAddBill = () => {
    setFormData({ name: "", interval: "Monthly", lastPaymentDate: "" });
    setEditingBill(null);
    setShowAddModal(true);
  };

  // Open the modal to edit an existing bill
  const handleEditBill = (bill) => {
    setFormData({
      name: bill.name,
      interval: bill.interval,
      lastPaymentDate: bill.lastPaymentDate,
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
      !formData.lastPaymentDate
    )
      return;
    try {
      if (editingBill) {
        // Update existing bill
        const billRef = doc(db, "users", user.uid, "bills", editingBill.id);
        await updateDoc(billRef, {
          name: formData.name.trim(),
          interval: formData.interval,
          lastPaymentDate: formData.lastPaymentDate,
          updatedAt: new Date(),
        });
      } else {
        // Add new bill
        await addDoc(collection(db, "users", user.uid, "bills"), {
          name: formData.name.trim(),
          interval: formData.interval,
          lastPaymentDate: formData.lastPaymentDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await loadBills();
      setShowAddModal(false);
      setFormData({ name: "", interval: "Monthly", lastPaymentDate: "" });
      setEditingBill(null);
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  // Delete a bill by ID
  const handleDeleteBill = async (billId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "bills", billId));
      await loadBills();
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  // Close the add/edit modal and reset form
  const closeModal = () => {
    setShowAddModal(false);
    setFormData({ name: "", interval: "Monthly", lastPaymentDate: "" });
    setEditingBill(null);
  };

  // Render the main UI
  return (
    <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

        {/* Calendar placeholder */}
        <div className="bg-zinc-900 border border-white/30 rounded-xl h-36 md:h-48 flex items-center justify-center mb-6 md:mb-10">
          <span className="text-gray-400 font-bold text-base md:text-lg select-none text-center px-4">
            Calendar for Recurring Bills
          </span>
        </div>

        {/* Bills list */}
        <div className="flex flex-col gap-4 md:gap-5">
          {loading ? (
            <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
              <p className="text-gray-400">Loading bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="bg-zinc-900 border border-white/30 rounded-xl px-6 py-8 text-center">
              <p className="text-gray-400 text-lg">No bills added yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Add Recurring Bill" to get started
              </p>
            </div>
          ) : (
            bills.map((bill) => {
              const daysUntilNext = getDaysUntilNext(
                bill.lastPaymentDate,
                bill.interval
              );
              const isOverdue = daysUntilNext < 0;
              const isDueSoon = daysUntilNext <= 3 && daysUntilNext >= 0;

              return (
                <div
                  key={bill.id}
                  className={`bg-zinc-900 border rounded-xl px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between shadow ${
                    isOverdue
                      ? "border-red-500/50 bg-red-900/20"
                      : isDueSoon
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
                          isOverdue
                            ? "bg-red-500 text-white"
                            : isDueSoon
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {bill.interval}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Recent Payment: {formatDate(bill.lastPaymentDate)}
                    </p>
                    <p
                      className={`text-sm md:text-base ${
                        isOverdue
                          ? "text-red-400"
                          : isDueSoon
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      Next Payment:{" "}
                      {getNextPaymentDate(bill.lastPaymentDate, bill.interval)}
                      {isOverdue && (
                        <span className="ml-2 text-red-500 font-semibold">
                          ({Math.abs(daysUntilNext)} days overdue)
                        </span>
                      )}
                      {isDueSoon && !isOverdue && (
                        <span className="ml-2 text-yellow-500 font-semibold">
                          ({daysUntilNext} days remaining)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="border-2 border-yellow-300 text-yellow-300 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="border-2 border-red-500 text-red-500 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-bold hover:bg-red-500 hover:text-white transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
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

      {/* Modal for adding/editing a bill */}
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
                    setFormData({ ...formData, name: e.target.value })
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
                    setFormData({ ...formData, interval: e.target.value })
                  }
                  className="w-full border border-gray-600 rounded-lg p-3 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer"
                  required
                >
                  {intervalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Payment Date
                </label>
                <input
                  type="date"
                  value={formData.lastPaymentDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastPaymentDate: e.target.value,
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
    </div>
  );
}
