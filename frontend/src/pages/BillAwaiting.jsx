import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BillAwaiting() {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const messages = ["Analyzing Bill", "Reading Bill", "Summarizing Bill"];

    const [messageIndex, setMessageIndex] = useState(0);
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        const file = location.state?.file;
        if (!file) {
            setError("No image file provided.");
            setLoading(false);
            setTimeout(() => navigate("/bill/summarization"), 1500);
            return;
        }

        const controller = new AbortController();
        const formData = new FormData();
        formData.append("prompt_img", file);

        fetch("http://localhost:8000/bill/bill_reading", {
            method: "POST",
            body: formData,
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Failed to process the bill image.");
                }
                const data = await res.json();
                let billData;
                try {
                    billData =
                        typeof data.response === "string"
                            ? JSON.parse(data.response)
                            : data.response;
                } catch {
                    throw new Error("Failed to parse response.");
                }
                navigate("/bill/result", {
                    state: { billData, file },
                });
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [location, navigate]);

    useEffect(() => {
        if (!loading) return;

        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);

        const dotInterval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 500);

        return () => {
            clearInterval(interval);
            clearInterval(dotInterval);
        };
    }, [loading]);

    const dots = ".".repeat(dotCount);

    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white px-4">
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl flex flex-col items-center justify-center w-full max-w-[400px] h-[300px] p-6 shadow-2xl">
                        {loading && !error && (
                            <>
                                {/* Spinner */}
                                <svg
                                    className="animate-spin h-12 w-12 text-yellow-300 mb-4"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-20"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
                                <span className="text-lg md:text-2xl font-bold text-center text-white">
                                    {messages[messageIndex]}
                                    {dots}
                                </span>
                            </>
                        )}
                        {error && (
                            <div className="flex flex-col items-center justify-center">
                                <div className="text-red-500 mt-4 text-center text-sm md:text-base">
                                    {error}
                                </div>
                                <button
                                    className="mt-6 px-4 py-2 border-2 border-white rounded-full text-white font-semibold hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                                    onClick={() =>
                                        navigate("/bill/summarization")
                                    }
                                >
                                    Back to Upload
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
