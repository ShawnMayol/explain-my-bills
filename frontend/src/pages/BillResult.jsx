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

// Custom hook for React Router v6 navigation blocking
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

    // This ref controls whether blocking is enabled
    const shouldBlockRef = useRef(true);

    const promptMsg =
        "Are you sure you want to leave? You have unsaved changes.";

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
            navigate("/dashboard");
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
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white overflow-y-auto">
            <Sidebar />
            <main className="ml-[20%] flex-1 flex flex-col items-center px-10 py-12 min-h-screen">
                <div className="w-full max-w-6xl">
                    <span className="mb-6 block text-yellow-300 font-semibold text-2xl">
                        Summarized Bill Result
                    </span>
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Image */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="w-[340px] h-[400px] bg-zinc-900 border-2 border-white rounded-lg flex items-center justify-center mb-4">
                                {imgUrl ? (
                                    <img
                                        src={imgUrl}
                                        alt="bill"
                                        className="object-contain h-full w-full rounded"
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
                                    <span className="font-semibold">
                                        {billData.billType || "—"}
                                    </span>
                                </div>
                                <div>
                                    <b className="text-yellow-300">Issuer:</b>{" "}
                                    <span className="font-semibold">
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
                                    className="w-full border border-white/20 rounded bg-zinc-900 px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300 h-30"
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
                                    className="w-full border border-white/20 rounded bg-zinc-900 px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300 h-30"
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
                                <span className="font-semibold">
                                    {billData.discrepancies || "None"}
                                </span>
                            </div>
                            <div className="flex gap-8 justify-end mt-6 mb-10">
                                <button
                                    className="w-32 py-2 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                                <button
                                    className="w-32 py-2 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition cursor-pointer"
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
