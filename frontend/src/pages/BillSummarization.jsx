import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const MAX_FILE_SIZE_MB = 5;

export default function BillSummarization() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setError("");
        const file = e.target.files[0];

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPG, PNG, etc).");
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`Image must be less than ${MAX_FILE_SIZE_MB}MB.`);
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUpload = () => {
        if (!selectedFile) {
            setError("Please select an image.");
            return;
        }

        navigate("/bill/awaiting", {
            state: {
                file: selectedFile,
                previewUrl: previewUrl
            }
        });
    };

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="flex min-h-screen w-screen bg-[#1B1C21] text-white overflow-y-auto relative">
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

            <main className="md:ml-[20%] flex-1 flex flex-col justify-center min-h-screen px-4 md:px-10 mt-16 md:mt-0">
                <div className="w-full max-w-6xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-yellow-300">
                        Bill Summarization
                    </h1>
                    <hr className="mb-8 border-t-2 border-gray-200/50" />
                    <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <section className="flex-1 mb-8 md:mb-0">
                            <p className="mb-4 text-gray-300 font-semibold text-lg">
                                Upload Bill
                            </p>
                            <ul className="mb-8 text-base text-gray-400 list-disc list-inside leading-relaxed">
                                <li>
                                    Only clear, readable images (JPG, PNG,
                                    JPEG).
                                </li>
                                <li>Maximum file size: 5MB.</li>
                                <li>
                                    Make sure your bill is flat and not folded
                                    for best results.
                                </li>
                            </ul>
                            {error && (
                                <div className="text-red-500 mb-2">{error}</div>
                            )}
                        </section>

                        <section className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full max-w-[480px] h-[300px] sm:h-[370px] bg-zinc-900 border-2 border-white rounded-2xl flex items-center justify-center text-gray-400 text-xl sm:text-2xl font-bold cursor-pointer mb-6 outline-none focus:ring-2 focus:ring-yellow-300 transition"
                                onClick={() => fileInputRef.current.click()}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ")
                                        fileInputRef.current.click();
                                }}
                                role="button"
                                aria-label="Upload bill image"
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Bill preview"
                                        className="object-contain h-full max-w-full rounded"
                                    />
                                ) : (
                                    <span className="text-center">
                                        Click or tap here
                                        <br />
                                        to upload your bill
                                    </span>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                            />
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className={`mt-2 px-8 py-3 border-2 border-white font-semibold rounded-full text-base sm:text-lg text-white transition ${
                                    selectedFile
                                        ? "hover:bg-yellow-300 hover:text-black hover:cursor-pointer"
                                        : "bg-gray-600 cursor-not-allowed border-gray-600"
                                }`}
                            >
                                Upload Bill
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
