import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

export default function BillDetail() {
    const { billId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [billData, setBillData] = useState(null);
    const [imgUrl, setImgUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const billRef = doc(db, "users", user.uid, "bills", billId);
                const billSnap = await getDoc(billRef);

                if (billSnap.exists()) {
                    const data = billSnap.data();
                    setBillData(data);
                    setImgUrl(data.imageUrl || null);
                } else {
                    setError("Bill not found");
                }
            } catch (err) {
                setError("Failed to load bill.");
            } finally {
                setLoading(false);
            }
        };

        fetchBill();
    }, [billId, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1B1C21] text-white">
                Loading…
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#1B1C21] text-white">
                <h1 className="text-2xl font-bold text-red-500">{error}</h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 px-4 py-2 border border-white rounded hover:bg-yellow-300 hover:text-black"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!billData) return null;

    const highlightStr = Array.isArray(billData.highlights)
        ? billData.highlights
              .map((h) =>
                  typeof h === "string"
                      ? h
                      : Object.entries(h)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")
              )
              .join("\n")
        : "";

    return (
        <div className="flex min-h-screen w-full bg-[#1B1C21] text-white overflow-y-auto overflow-x-hidden relative">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div
                className={`fixed top-0 left-0 right-0 z-30 md:hidden flex items-center h-12 px-4 py-7 transition-colors duration-300 ${
                    scrolled ? "bg-black/50" : "bg-black/10"
                }`}
            >
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            {showImageModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                    onClick={() => setShowImageModal(false)}
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white text-3xl z-10 rounded-full p-2 transition cursor-pointer"
                            onClick={() => setShowImageModal(false)}
                            aria-label="Close"
                        >
                            <HiOutlineX />
                        </button>
                        <img
                            src={imgUrl}
                            alt="bill full"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}

            <main className="md:ml-[20%] flex-1 flex flex-col items-center px-4 md:px-10 py-12 min-h-screen mt-4">
                <div className="w-full max-w-6xl">
                    <h1 className="mb-6 text-3xl font-bold text-yellow-300">
                        Bill Information
                    </h1>
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex-shrink-0 flex` flex-col items-center">
                            <div className="w-full max-w-[340px] h-[400px] bg-zinc-900 border-2 border-white rounded-lg flex items-center justify-center mb-4">
                                {imgUrl ? (
                                    <img
                                        src={imgUrl}
                                        alt="bill"
                                        className="object-contain h-full w-full rounded cursor-zoom-in"
                                        onClick={() => setShowImageModal(true)}
                                    />
                                ) : (
                                    <span className="text-gray-400">
                                        No Image
                                    </span>
                                )}
                            </div>
                        </div>

                        <section className="flex-1 flex flex-col space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                                <InfoItem
                                    label="Bill Type"
                                    value={billData.billType}
                                />
                                <InfoItem
                                    label="Issuer"
                                    value={billData.issuer}
                                />
                                <InfoItem
                                    label="Total"
                                    value={
                                        billData.totalBill !== undefined
                                            ? `Php ${billData.totalBill.toLocaleString(
                                                  "en-PH",
                                                  {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                  }
                                              )}`
                                            : "—"
                                    }
                                />
                                <InfoItem
                                    label="Bill Date"
                                    value={
                                        billData.billDate
                                            ? new Date(
                                                  billData.billDate
                                              ).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              })
                                            : "—"
                                    }
                                />
                            </div>

                            <Card
                                title="Explanation"
                                content={billData.explanation}
                            />
                            <Card
                                title="Highlights"
                                content={highlightStr || "None"}
                            />
                            <Card
                                title="Discrepancies"
                                content={billData.discrepancies || "None"}
                            />

                            <div className="flex justify-end">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="px-6 py-2 border-2 border-white rounded-full hover:bg-yellow-300 hover:text-black"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <b className="text-yellow-300">{label}:</b>{" "}
            <span className="font-semibold break-words">{value || "—"}</span>
        </div>
    );
}

function Card({ title, content }) {
    return (
        <div>
            <h2 className="text-yellow-300 mb-2 font-semibold">{title}:</h2>
            <div className="w-full border border-white/20 rounded bg-zinc-900 p-4 text-white font-medium max-h-64 overflow-y-auto">
                {content}
            </div>
        </div>
    );
}
