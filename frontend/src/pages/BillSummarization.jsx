import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MAX_FILE_SIZE_MB = 5;

export default function BillSummarization() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
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

        // File type check
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPG, PNG, etc).");
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }
        // File size check
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
        setError("");
        if (!selectedFile) {
            setError("Please select an image.");
            return;
        }
        navigate("/bill/awaiting", { state: { file: selectedFile } });
    };

    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white overflow-y-auto">
            <Sidebar />
            <main className="ml-[20%] flex-1 flex flex-col justify-center min-h-screen px-8 py-12">
                <div className="w-full max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2 text-yellow-300">
                        Bill Summarization
                    </h1>
                    <hr className="mb-8 border-t-2 border-gray-200/50" />
                    <div className="flex flex-col md:flex-row gap-16">
                        {/* Info and Instructions */}
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

                        {/* Upload Area */}
                        <section className="flex-1 flex flex-col items-center">
                            <div
                                className="w-[480px] max-w-full h-[370px] bg-zinc-900 border-2 border-white rounded-2xl flex items-center justify-center text-gray-400 text-2xl font-bold cursor-pointer mb-6 outline-none focus:ring-2 focus:ring-yellow-300 transition"
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
                                    <span>
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
                                className={`mt-2 px-10 py-3 border-2 border-white font-semibold rounded-full text-lg text-white transition ${
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
