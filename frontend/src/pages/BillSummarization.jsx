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
        <div className="flex h-screen w-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-4xl">
                    <h1 className="text-3xl font-bold mb-2">
                        Bill Summarization
                    </h1>
                    <hr className="mb-8 border-t-2 border-gray-200" />
                    <p className="mb-2 text-gray-500 font-semibold">
                        Upload Bill
                    </p>
                    <ul className="mb-4 text-sm text-gray-600 list-disc list-inside">
                        <li>Only clear, readable images (JPG, PNG, JPEG).</li>
                        <li>Maximum file size: 5MB.</li>
                        <li>
                            Make sure your bill is flat and not folded for best
                            results.
                        </li>
                    </ul>
                    <div
                        className="w-[400px] h-[300px] bg-gray-100 border rounded-lg flex items-center justify-center text-gray-400 text-2xl font-bold cursor-pointer mb-6 outline-none focus:ring-2 focus:ring-blue-300"
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
                                className="object-contain h-full rounded"
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
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        className={`mt-2 px-8 py-2 border font-semibold rounded-full transition ${
                            selectedFile
                                ? "hover:bg-gray-100"
                                : "bg-gray-200 cursor-not-allowed"
                        }`}
                    >
                        Upload Bill
                    </button>
                </div>
            </div>
        </div>
    );
}
