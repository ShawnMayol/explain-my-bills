import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
    orderBy,
    limit,
    startAfter,
    collection,
    getDocs,
    query,
    getCountFromServer,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { HiChevronLeft, HiChevronRight, HiOutlineMenu } from "react-icons/hi";

export default function Dashboard() {
    const PAGE_SIZE = 6;

    const [bills, setBills] = useState([]);
    const [pageCursors, setPageCursors] = useState([null]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;

    const initCount = async () => {
        if (!user) return;
        const colRef = collection(db, "users", user.uid, "bills");
        const countSnap = await getCountFromServer(colRef);
        const count = countSnap.data().count;
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
    };

    const goToPage = async (pageNum, showLoader) => {
        if (!user || pageNum < 1 || pageNum > totalPages) return;
        if (showLoader) setLoading(true);

        try {
            let q = query(
                collection(db, "users", user.uid, "bills"),
                orderBy("createdAt", "desc"),
                limit(PAGE_SIZE)
            );

            const cursor = pageCursors[pageNum - 1];
            if (cursor) q = query(q, startAfter(cursor));

            const snap = await getDocs(q);
            const docs = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBills(docs);

            const lastDoc = snap.docs[snap.docs.length - 1] || null;
            setPageCursors((prev) => {
                const next = [...prev];
                next[pageNum] = lastDoc;
                return next;
            });

            setCurrentPage(pageNum);
        } catch (err) {
            console.error("Failed to load bills:", err);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const getPageList = () => {
        const delta = 1;
        let start = Math.max(1, currentPage - delta);
        let end = Math.min(totalPages, currentPage + delta);
        const range = [];

        for (let i = start; i <= end; i++) range.push(i);

        if (start > 2) {
            range.unshift("...");
            range.unshift(1);
        } else if (start === 2) {
            range.unshift(1);
        }

        if (end < totalPages - 1) {
            range.push("...");
            range.push(totalPages);
        } else if (end === totalPages - 1) {
            range.push(totalPages);
        }

        return range;
    };

    useEffect(() => {
        if (!user) {
            console.warn("User not logged in");
            return;
        }

        initCount().then(() => goToPage(1, true));
    }, [user]);

    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    return (
        <div className="relative flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="absolute top-0 left-0 right-0 z-30 md:hidden bg-black/10 flex items-center h-12 px-4 py-7">
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <div className="absolute left-90 -top-30 w-160 h-160 rounded-full bg-gray-100 opacity-8 blur-3xl pointer-events-none z-0"></div>
            <div className="absolute -right-20 -bottom-40 w-90 h-90 rounded-full bg-gray-100 opacity-8 blur-3xl pointer-events-none z-0"></div>

            <div className="md:ml-[20%] flex-1 px-4 md:px-10 relative overflow-y-auto pb-10">
                <h1 className="text-2xl md:text-4xl text-yellow-300 font-bold mt-12 md:mt-15 mb-8 md:mb-12">
                    Recent Summarized Bills
                </h1>

                <div className="flex justify-center md:justify-start gap-1 mb-4 md:mb-6">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={isFirst}
                        className="p-2 rounded-full disabled:opacity-50 not-disabled:hover:bg-gray-700 not-disabled:cursor-pointer"
                    >
                        <HiChevronLeft className="w-5 h-5" />
                    </button>

                    {getPageList().map((p, idx) =>
                        p === "..." ? (
                            <span key={`el-${idx}`} className="px-2">
                                ...
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => goToPage(p)}
                                className={`w-10 py-1 text-base border rounded cursor-pointer ${
                                    p === currentPage
                                        ? "bg-yellow-300 text-black"
                                        : "hover:bg-gray-700"
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={isLast}
                        className="p-2 rounded-full disabled:opacity-50 not-disabled:hover:bg-gray-700 not-disabled:cursor-pointer"
                    >
                        <HiChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {loading ? (
                        Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-gray-600 rounded-lg p-4 flex flex-col bg-zinc-900 animate-pulse h-[420px]"
                            >
                                <div className="w-full h-48 bg-gray-700 rounded mb-4" />
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="w-3/5 h-5 bg-gray-700 rounded mx-auto mb-4" />
                                        <div className="space-y-2">
                                            <div className="w-full h-4 bg-gray-700 rounded" />
                                            <div className="w-full h-4 bg-gray-700 rounded" />
                                            <div className="w-5/6 h-4 bg-gray-700 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-700 rounded w-2/5 self-end mt-4" />
                                </div>
                            </div>
                        ))
                    ) : bills.length > 0 ? (
                        bills.map((bill) => (
                            <Link
                                key={bill.id}
                                to={`/bill/${bill.id}`}
                                className="border border-gray-600 rounded-lg p-4 flex flex-col bg-zinc-900 hover:ring-2 hover:ring-yellow-300 transition h-[420px]"
                            >
                                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-gray-800">
                                    {bill.imageUrl ? (
                                        <img
                                            src={bill.imageUrl}
                                            alt="Bill"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-center mb-3 text-yellow-300">
                                            {bill.issuer || bill.billType || "Unnamed Bill"}
                                        </p>
                                        <p className="text-sm text-gray-300 text-justify line-clamp-4">
                                            {bill.explanation?.slice(0, 256) ||
                                                "No explanation available."}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 text-end">
                                        {bill.billDate
                                            ? new Date(bill.billDate).toLocaleDateString(
                                                  "en-US",
                                                  {
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                  }
                                              )
                                            : "—"}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-400 text-lg">
                                No bills found for this account.
                            </p>
                        </div>
                    )}
                </div>

                <Link
                    to="/bill/summarization"
                    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-zinc-900 border-2 border-white text-2xl md:text-3xl font-semibold rounded-full hover:bg-yellow-300 hover:text-black transition shadow-lg"
                >
                    +
                </Link>
            </div>
        </div>
    );
}
