import React from "react";

export default function SplashScreen() {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-white">
            <p className="text-xl font-semibold text-gray-600">Loading...</p>
            {/* <img src="/splash.gif" alt="Loading..." className="w-24 h-24" /> */}
        </div>
    );
}
