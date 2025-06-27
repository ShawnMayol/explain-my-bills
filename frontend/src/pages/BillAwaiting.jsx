import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function BillAwaiting() {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const file = location.state?.file;
        if (!file) {
            setError("No image file provided.");
            setLoading(false);
            // Redirect to BillSummarization after 1.5s
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

    return (
        <div className="flex h-screen w-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-2xl flex flex-col items-center">
                    <h2 className="text-lg text-gray-500 mb-2 font-semibold">
                        Fetching Results
                    </h2>
                    <div className="bg-white rounded-lg flex flex-col items-center justify-center w-[400px] h-[300px] border shadow">
                        {loading && !error && (
                            <>
                                {/* Spinner */}
                                <svg
                                    className="animate-spin h-12 w-12 text-gray-400 mb-4"
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
                                <span className="text-2xl font-bold text-gray-700">
                                    Awaiting Results
                                </span>
                            </>
                        )}
                        {error && (
                            <div className="flex flex-col items-center justify-center">
                                <div className="text-red-500 mt-4 text-center">
                                    {error}
                                </div>
                                <button
                                    className="mt-6 px-4 py-2 rounded bg-blue-600 text-white font-semibold"
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
