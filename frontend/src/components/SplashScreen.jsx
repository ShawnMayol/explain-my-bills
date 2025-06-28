import React from "react";

export default function SplashScreen() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white">
            <div className="flex flex-col items-center gap-6">
                <svg
                    className="animate-spin h-16 w-16 text-yellow-300"
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
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    />
                </svg>
                <p className="text-xl font-semibold text-yellow-300 tracking-wide">
                    Loading...
                </p>
            </div>
        </div>
    );
}
