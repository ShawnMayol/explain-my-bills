import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import {
    HiOutlineMenu,
    HiOutlineX,
    HiTrash,
    HiDotsVertical,
    HiOutlineExclamation,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (billData.publicId) {
                console.log(
                    "Deleting image with public ID:",
                    billData.publicId
                );
                const response = await fetch(
                    "http://127.0.0.1:8000/delete-cloudinary",
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            publicId: billData.publicId,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete image from Cloudinary");
                }
            }

            await deleteDoc(doc(db, "users", user.uid, "bills", billId));
            setShowDeleteDialog(false);
            navigate("/dashboard");
        } catch (err) {
            console.error("Error deleting bill:", err);
            setError("Failed to delete bill. Please try again.");
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (loading) {
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
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <HiOutlineX size={28} />
                        ) : (
                            <HiOutlineMenu size={28} />
                        )}
                    </button>
                </div>

                <div className="flex-1 p-4 pt-[3.5rem] md:ml-64">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-yellow-300">
                                Bill Details
                            </h1>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setShowDropdown(!showDropdown)
                                    }
                                    className="p-2 text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                                >
                                    <HiDotsVertical className="w-5 h-5" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-40">
                                        <ul className="p-1">
                                            <li>
                                                <button
                                                    onClick={() => {
                                                        console.log(
                                                            "Delete button clicked in loading state"
                                                        );
                                                        setShowDropdown(false);
                                                        setShowDeleteDialog(
                                                            true
                                                        );
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-white hover:bg-zinc-700 flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <HiTrash className="w-4 h-4 text-red-500" />
                                                    <span>Delete Bill</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-[300px] h-[400px] bg-zinc-900 border-2 rounded-lg flex items-center justify-center mb-4">
                                    <div className="w-full h-full bg-zinc-800 rounded animate-pulse"></div>
                                </div>
                            </div>

                            <section className="flex-1 flex flex-col space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                                    <div>
                                        <b className="text-yellow-300">
                                            Bill Type:
                                        </b>{" "}
                                        <div className="inline-block h-5 w-24 bg-zinc-800 rounded animate-pulse"></div>
                                    </div>
                                    <div>
                                        <b className="text-yellow-300">
                                            Issuer:
                                        </b>{" "}
                                        <div className="inline-block h-5 w-32 bg-zinc-800 rounded animate-pulse"></div>
                                    </div>
                                    <div>
                                        <b className="text-yellow-300">
                                            Total:
                                        </b>{" "}
                                        <div className="inline-block h-5 w-28 bg-zinc-800 rounded animate-pulse"></div>
                                    </div>
                                    <div>
                                        <b className="text-yellow-300">
                                            Bill Date:
                                        </b>{" "}
                                        <div className="inline-block h-5 w-36 bg-zinc-800 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-yellow-300 mb-2 font-semibold">
                                        Explanation:
                                    </h2>
                                    <div className="w-full border border-white/20 rounded bg-zinc-900 p-4 text-white font-medium max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse"></div>
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-5/6"></div>
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-4/5"></div>
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-yellow-300 mb-2 font-semibold">
                                        Highlights:
                                    </h2>
                                    <div className="w-full border border-white/20 rounded bg-zinc-900 p-4 text-white font-medium max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-4/5"></div>
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/5"></div>
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-5/6"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-yellow-300 mb-2 font-semibold">
                                        Discrepancies:
                                    </h2>
                                    <div className="w-full border border-white/20 rounded bg-zinc-900 p-4 text-white font-medium max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-2/3"></div>
                                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-4/5"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="px-6 py-2 border-2 border-white rounded-full hover:bg-yellow-300 hover:text-black cursor-pointer"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
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
        <>
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
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <HiOutlineX size={28} />
                        ) : (
                            <HiOutlineMenu size={28} />
                        )}
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

                <div className="flex-1 p-4 pt-[3.5rem] md:ml-64">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-yellow-300">
                                Bill Details
                            </h1>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setShowDropdown(!showDropdown)
                                    }
                                    className="p-2 text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                                >
                                    <HiDotsVertical className="w-5 h-5" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg z-40">
                                        <ul className="p-1">
                                            <li>
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        setShowDeleteDialog(
                                                            true
                                                        );
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-white hover:bg-zinc-700 rounded-xl flex items-center space-x-2 cursor-pointer align-center"
                                                >
                                                    <HiTrash className="w-4 h-4 text-red-500" />
                                                    <span>Delete Bill</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-full max-w-[340px] h-[400px] bg-zinc-900 border-2 border-white rounded-lg flex items-center justify-center mb-4">
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt="bill"
                                            className="object-contain h-full w-full rounded cursor-zoom-in"
                                            onClick={() =>
                                                setShowImageModal(true)
                                            }
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
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "long",
                                                          day: "numeric",
                                                      }
                                                  )
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

                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="px-6 py-2 border-2 border-white rounded-full hover:bg-yellow-300 hover:text-black cursor-pointer"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {showDeleteDialog && (
                    <Dialog
                        open={showDeleteDialog}
                        onClose={() =>
                            !isDeleting && setShowDeleteDialog(false)
                        }
                        aria-labelledby="delete-dialog-title"
                        aria-describedby="delete-dialog-description"
                        PaperProps={{
                            sx: {
                                bgcolor: "#27272a",
                                border: "1px solid #3f3f46",
                                borderRadius: 2,
                                color: "white",
                            },
                        }}
                    >
                        <DialogTitle
                            id="delete-dialog-title"
                            sx={{
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                                <HiOutlineExclamation className="h-6 w-6 text-red-600" />
                            </div>
                            Delete Bill
                        </DialogTitle>

                        <DialogContent id="delete-dialog-description">
                            <p className="text-sm text-gray-300">
                                Are you sure you want to delete this bill? This
                                action cannot be undone, and the bill data will
                                be permanently removed from our servers.
                            </p>
                        </DialogContent>

                        <DialogActions sx={{ padding: 2, gap: 1 }}>
                            <Button
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={isDeleting}
                                sx={{
                                    color: "white",
                                    borderColor: "#3f3f46",
                                    backgroundColor: "#27272a",
                                    "&:hover": {
                                        backgroundColor: "#3f3f46",
                                    },
                                    "&:disabled": {
                                        backgroundColor: "#1f1f23",
                                        color: "#6b7280",
                                    },
                                }}
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                sx={{
                                    backgroundColor: isDeleting
                                        ? "#b91c1c"
                                        : "#dc2626",
                                    "&:hover": {
                                        backgroundColor: "#b91c1c",
                                    },
                                    color: "white",
                                }}
                                variant="contained"
                                startIcon={
                                    isDeleting ? (
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        <HiTrash className="h-4 w-4" />
                                    )
                                }
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </div>
        </>
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
