import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white">
            <h1 className="text-6xl font-bold mb-6 text-yellow-300 drop-shadow-lg">404</h1>
            <p className="text-2xl mb-8 text-gray-300">Page Not Found</p>
            <button
                onClick={() => navigate("/Dashboard")}
                className="px-8 py-3 border-2 border-white font-semibold rounded-xl text-lg text-white hover:bg-gray-100 hover:text-black transition hover:cursor-pointer"
            >
                Back to Home
            </button>
        </div>
    );
}
