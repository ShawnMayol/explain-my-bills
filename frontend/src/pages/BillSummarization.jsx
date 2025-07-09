import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    HiOutlineMenu,
    HiCamera,
    HiOutlineX,
    HiUpload,
    HiSwitchHorizontal,
    HiPhotograph,
} from "react-icons/hi";

const MAX_FILE_SIZE_MB = 5;

export default function BillSummarization() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const [flash, setFlash] = useState(false);

    const fileInputRef = useRef();
    const videoRef = useRef();
    const streamRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        setHasCamera(!!navigator.mediaDevices?.getUserMedia);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleFileChange = (e) => {
        setError("");
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPG, PNG, etc).");
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`Image must be less than ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const startCamera = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
            });
            streamRef.current = stream;
            setShowCamera(true);
        } catch (err) {
            console.error(err);
            setError("Unable to access camera");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    const toggleCamera = () => {
        if (showCamera) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const flipCamera = () => {
        const newMode = facingMode === "environment" ? "user" : "environment";
        setFacingMode(newMode);
        stopCamera();
        setTimeout(() => {
            startCamera();
        }, 200);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const file = new File([blob], "captured.jpg", {
                type: "image/jpeg",
            });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera();
        }, "image/jpeg");
    };

    useEffect(() => {
        if (showCamera && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [showCamera]);

    const handleUpload = () => {
        if (!selectedFile) {
            setError("Please select an image.");
            return;
        }

        if (showCamera) {
            stopCamera(); // fail-safe
        }

        navigate("/bill/awaiting", { state: { file: selectedFile } });
    };

    return (
        <div className="flex min-h-screen bg-[#1B1C21] text-white relative">
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
                    onClick={() => setSidebarOpen(true)}
                    className="text-yellow-300 hover:text-white"
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
                        <section className="flex-1">
                            <p className="mb-4 text-gray-300 font-semibold text-lg">
                                Upload Bill
                            </p>
                            <ul className="mb-8 text-base text-gray-400 list-disc list-inside">
                                <li>Only clear, readable images (JPG, PNG).</li>
                                <li>Max file size: 5MB.</li>
                                <li>Keep the bill flat & unfolded.</li>
                            </ul>
                            {error && (
                                <div className="text-red-500 mb-2">{error}</div>
                            )}
                        </section>

                        <section className="flex-1 flex flex-col items-center">
                            <div
                                className="relative w-full max-w-[480px] h-[300px] sm:h-[370px] bg-zinc-900 border-2 border-white rounded-2xl flex items-center justify-center text-gray-400 text-xl font-bold cursor-pointer mb-6"
                                onClick={() =>
                                    !showCamera && fileInputRef.current.click()
                                }
                                role="button"
                                tabIndex={0}
                                aria-label="Upload bill image"
                            >
                                {showCamera ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                        <div
                                            className="absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-150"
                                            style={{ opacity: flash ? 1 : 0 }}
                                        />
                                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                                            <button
                                                onClick={capturePhoto}
                                                className="p-3 bg-yellow-300 text-black rounded-full hover:bg-yellow-400 text-lg flex items-center justify-center cursor-pointer"
                                                aria-label="Capture"
                                            >
                                                <HiCamera />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-2 right-2">
                                            <button
                                                onClick={flipCamera}
                                                className="
                                                        p-3 
                                                        bg-white/25 
                                                        backdrop-blur-md 
                                                        text-white 
                                                        rounded-full 
                                                        hover:bg-gray-400/60 
                                                        text-lg 
                                                        flex 
                                                        items-center 
                                                        justify-center
                                                        shadow-md
                                                        cursor-pointer
                                                    "
                                                aria-label="Flip Camera"
                                            >
                                                <HiSwitchHorizontal />
                                            </button>
                                        </div>
                                    </>
                                ) : previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="object-contain h-full max-w-full rounded"
                                    />
                                ) : (
                                    <span>Click here to upload your bill</span>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                                className="hidden"
                            />

                            <div className="flex flex-wrap justify-center gap-4 px-2">
                                {hasCamera && (
                                    <button
                                        onClick={toggleCamera}
                                        className={`
                                            px-6 py-2 
                                            border-2 border-white 
                                            rounded-full 
                                            hover:bg-yellow-300 hover:text-black 
                                            flex items-center justify-center gap-2 cursor-pointer 
                                            w-full md:w-55
                                        `}
                                    >
                                        {showCamera ? (
                                            <HiOutlineX />
                                        ) : (
                                            <HiCamera />
                                        )}
                                        {showCamera
                                            ? "Close Camera"
                                            : "Open Camera"}
                                    </button>
                                )}

                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile}
                                    className={`
                                        px-6 py-2 border-2 rounded-full flex items-center justify-center gap-2 
                                        w-full md:w-55
                                        ${
                                            selectedFile
                                                ? "border-white hover:bg-yellow-300 hover:text-black cursor-pointer"
                                                : "border-gray-600 bg-gray-600 cursor-not-allowed"
                                        }
                                    `}
                                >
                                    <HiUpload />
                                    Upload Bill
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
