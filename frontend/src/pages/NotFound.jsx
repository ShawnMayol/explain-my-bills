import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
            <h1 className="text-6xl font-bold mb-6 text-gray-800">404</h1>
            <p className="text-2xl mb-8 text-gray-600">Page Not Found</p>
            <button
                onClick={() => navigate("/")}
                className="px-8 py-3 border-2 font-semibold rounded-xl text-lg hover:cursor-pointer"
            >
                Back to Home
            </button>
        </div>
    );
}
