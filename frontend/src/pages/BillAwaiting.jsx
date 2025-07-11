import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";

export default function BillAwaiting() {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        if (!loading) return;
        const dotInterval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 800);
        return () => clearInterval(dotInterval);
    }, [loading]);

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
                setTimeout(() => {
                    navigate("/bill/result", {
                        state: { billData, file },
                    });
                }, 400);
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

    const dots = ".".repeat(dotCount);

    let progressText = "";
    if (error) {
        progressText = "";
    } else if (loading) {
        progressText = "Analyzing bill" + dots;
    }

    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white px-4">
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl flex flex-col items-center">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl flex flex-col items-center justify-center w-full max-w-[95vw] md:max-w-[600px] h-[320px] md:h-[340px] p-6 shadow-2xl">
                        {loading && !error && (
                            <>
                                <span className="text-lg md:text-2xl font-bold text-center text-white mb-6">
                                    {progressText}
                                </span>
                                <div className="w-full flex flex-col items-center">
                                    <LinearProgress
                                        variant="indeterminate"
                                        sx={{
                                            height: 12,
                                            borderRadius: 6,
                                            width: "100%",
                                            backgroundColor:
                                                "rgba(255,255,255,0.15)",
                                            "& .MuiLinearProgress-bar": {
                                                background:
                                                    "linear-gradient(90deg, #FFD600 0%, #FFEA00 100%)",
                                            },
                                        }}
                                    />
                                </div>
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
