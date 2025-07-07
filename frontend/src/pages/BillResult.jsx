import React, { useEffect, useState, useContext, useRef } from "react";
import {
    useLocation,
    useNavigate,
    UNSAFE_NavigationContext,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { HiOutlineMenu } from "react-icons/hi";

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

        if (!file) {
            alert("No file found. Please re-upload your bill.");
            navigate("/bill/summarization");
            return;
        }

        try {
            // generate cloudinary upload signature
            const userId = user.uid;
            const filename = file.name.split(".")[0];

            const sigRes = await fetch("http://127.0.0.1:8000/upload-signature", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, filename }),
            });

            const {
            cloudName,
            apiKey,
            timestamp,
            signature,
            folder,
            publicId,
            } = await sigRes.json();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("folder", folder);
            formData.append("public_id", publicId);

            const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
            );

            const cloudinaryData = await cloudinaryRes.json();

            const imageId = `bill-${Date.now()}`;
            const billDocRef = doc(
            collection(db, "users", user.uid, "bills"),
            imageId
            );

            await setDoc(billDocRef, {
            ...billData, 
            imageUrl: cloudinaryData.secure_url,
            publicId: cloudinaryData.public_id,
            imageId: imageId,
            createdAt: new Date().toISOString(),
            });

            shouldBlockRef.current = false;
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to save bill:", error);
            alert("Failed to save bill. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure?")) return;

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user || !billData?.imageId || !billData?.publicId) {
            alert("Something went wrong — missing user or bill data.");
            return;
        }

        try {
            // deleting from cloudinary (not sure if this works yet)
            await fetch("https://localhost:8000/delete-cloudinary", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: billData.publicId }),
            });

            const billDocRef = doc(db, "users", user.uid, "bills", billData.imageId);
            await deleteDoc(billDocRef);

            shouldBlockRef.current = false;
            window.location.assign("/dashboard");
        } catch (err) {
            console.error("Error deleting bill:", err);
            alert("Failed to delete the bill. Please try again.");
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

            {/* Top Bar Mobile */}
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
                                    className="w-28 md:w-32 py-2 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                                <button
                                    className="w-28 md:w-32 py-2 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition cursor-pointer"
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
