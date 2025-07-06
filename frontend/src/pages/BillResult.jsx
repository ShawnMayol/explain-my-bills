import React, { useEffect, useState, useContext, useRef } from "react";
import {
    useLocation,
    useNavigate,
    UNSAFE_NavigationContext,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { HiOutlineMenu } from "react-icons/hi";
import { HiOutlineX } from "react-icons/hi";

function usePrompt(message, shouldBlockRef) {
    const { navigator } = useContext(UNSAFE_NavigationContext);

    useEffect(() => {
        if (!shouldBlockRef.current) return;

        const push = navigator.push;
        navigator.push = (...args) => {
            if (window.confirm(message)) {
                push(...args);
            }
        };
        return () => {
            navigator.push = push;
        };
    }, [message, shouldBlockRef, navigator]);
}

export default function BillResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const billData = location.state?.billData;
    const file = location.state?.file;

    const [imgUrl, setImgUrl] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isBillValid, setIsBillValid] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    const shouldBlockRef = useRef(true);

    const promptMsg =
        "Are you sure you want to leave? You have unsaved changes.";
    useEffect(() => {
        if (!billData) {
            setIsBillValid(false);
            return;
        }
        if (typeof billData.isValidBill === "boolean") {
            setIsBillValid(billData.isValidBill);
        } else {
            const valid =
                !!billData.billType &&
                !!billData.issuer &&
                billData.totalBill !== undefined &&
                !!billData.explanation;
            setIsBillValid(valid);
        }
    }, [billData]);

    useEffect(() => {
        shouldBlockRef.current = true;
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (shouldBlockRef.current) {
                e.preventDefault();
                e.returnValue = promptMsg;
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [promptMsg]);

    usePrompt(promptMsg, shouldBlockRef);

    useEffect(() => {
        if (!billData || !file) {
            shouldBlockRef.current = false;
            navigate("/bill/summarization", { replace: true });
            return;
        }
        const url = URL.createObjectURL(file);
        setImgUrl(url);
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [billData, file, navigate]);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to save a bill.");
            return;
        }
        try {
            const imageId = `bill-${Date.now()}`;
            const billDocRef = doc(
                collection(db, "users", user.uid, "bills"),
                imageId
            );
            await setDoc(billDocRef, {
                ...billData,
                imageId: imageId,
                createdAt: new Date().toISOString(),
            });
            shouldBlockRef.current = false;
            window.location.assign("/dashboard");
        } catch (error) {
            console.error("Failed to save bill:", error);
            alert("Failed to save bill. Please try again.");
        }
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure?")) {
            shouldBlockRef.current = false;
            window.location.assign("/dashboard");
        }
    };

    if (!billData || !file) return null;

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
                    <span className="mb-6 block text-yellow-300 font-semibold text-2xl">
                        Summarized Bill Result
                    </span>
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Image */}
                        <div className="flex-shrink-0 flex flex-col items-center">
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
                        <section className="flex-1 flex flex-col">
                            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                                <div>
                                    <b className="text-yellow-300">
                                        Bill Type:
                                    </b>{" "}
                                    <span className="font-semibold break-words">
                                        {billData.billType || "—"}
                                    </span>
                                </div>
                                <div>
                                    <b className="text-yellow-300">Issuer:</b>{" "}
                                    <span className="font-semibold break-words">
                                        {billData.issuer || "—"}
                                    </span>
                                </div>
                                <div>
                                    <b className="text-yellow-300">Total:</b>{" "}
                                    <span className="font-semibold">
                                        {billData.totalBill !== undefined
                                            ? `Php ${billData.totalBill.toLocaleString(
                                                  "en-PH",
                                                  {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                  }
                                              )}`
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    <b className="text-yellow-300">
                                        Bill Date:
                                    </b>{" "}
                                    <span className="font-semibold">
                                        {billData.billDate
                                            ? new Date(
                                                  billData.billDate
                                              ).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              })
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 flex flex-col">
                                <b className="text-yellow-300 mb-2">
                                    Explanation:
                                </b>
                                <textarea
                                    className="w-full border border-white/20 rounded bg-zinc-900 px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    value={billData.explanation || ""}
                                    readOnly
                                    rows={8}
                                    style={{
                                        resize: "vertical",
                                        minHeight: 120,
                                        maxHeight: 250,
                                    }}
                                />
                            </div>
                            <div className="mb-6 flex flex-col">
                                <b className="text-yellow-300 mb-2">
                                    Highlights:
                                </b>
                                <textarea
                                    className="w-full border border-white/20 rounded bg-zinc-900 px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    value={highlightStr}
                                    readOnly
                                    rows={8}
                                    style={{
                                        resize: "vertical",
                                        minHeight: 120,
                                        maxHeight: 250,
                                    }}
                                />
                            </div>
                            <div className="mb-8">
                                <b className="text-yellow-300">
                                    Discrepancies:
                                </b>{" "}
                                <span className="font-semibold break-words">
                                    {billData.discrepancies || "None"}
                                </span>
                            </div>
                            <div className="flex gap-4 md:gap-8 justify-end mt-6 mb-10 flex-wrap">
                                <button
                                    className={`w-28 md:w-32 py-2 border-2 border-white rounded-full font-semibold text-white transition ${
                                        isBillValid
                                            ? "hover:bg-yellow-300 hover:text-black cursor-pointer"
                                            : "opacity-50 cursor-not-allowed"
                                    }`}
                                    onClick={handleSave}
                                    disabled={!isBillValid}
                                >
                                    Save
                                </button>
                                <button
                                    className="w-28 md:w-32 py-2 border-2 border-white rounded-full font-semibold text-white hover:bg-red-500 hover:text-white transition cursor-pointer"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
