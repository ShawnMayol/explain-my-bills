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
import { HiOutlineMenu } from "react-icons/hi";

export default function Dashboard() {
    const PAGE_SIZE = 9;

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

            <div className="md:ml-[20%] flex-1 px-10 relative overflow-y-auto">
                <h1 className="text-3xl text-yellow-300 font-bold mt-15 mb-10">
                    Recent Summarized Bills
                </h1>

                <div className="flex gap-1 mb-2">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={isFirst}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-700"
                    >
                        Prev
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
                                className={`px-3 py-1 text-sm border rounded ${
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
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-700"
                    >
                        Next
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {loading ? (
                        Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-gray-600 rounded-lg p-2 flex bg-zinc-900 animate-pulse"
                            >
                                <div className="w-32 h-36 bg-gray-700 rounded mr-4" />
                                <div className="flex-1 flex flex-col justify-between p-1">
                                    <div>
                                        <div className="mx-auto w-3/5 h-5 bg-gray-700 rounded" />
                                        <div className="space-y-1 mt-3">
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
                            <div
                                key={bill.id}
                                className="border border-gray-600 rounded-lg p-2 flex bg-zinc-900"
                            >
                                {bill.imageUrl ? (
                                    <img
                                        src={bill.imageUrl}
                                        alt="Bill"
                                        className="w-128 h-full object-cover rounded mr-4"
                                    />
                                ) : (
                                    <div className="w-164 h-full bg-gray-200 rounded mr-4"></div>
                                )}
                                <div className="flex flex-col justify-between p-1">
                                    <div>
                                        <p className="mt-2 font-semibold text-sm text-center">
                                            {bill.issuer ||
                                                bill.billType ||
                                                "Unnamed Bill"}
                                        </p>
                                        <p className="mt-3 text-[10px] text-gray-300 text-justify hyphens-auto line-clamp-4">
                                            {bill.explanation?.slice(0, 192) ||
                                                "No explanation available."}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 text-end">
                                        {bill.billDate || "No Date"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 col-span-2">
                            No bills found for this account.
                        </p>
                    )}
                </div>

                <Link
                    to="/bill/summarization"
                    className="absolute bottom-10 right-10 px-6 py-3 border-2 border-white text-2xl font-semibold rounded-3xl hover:bg-gray-100 hover:text-black transition"
                >
                    +
                </Link>
            </div>
        </div>
    );
}
