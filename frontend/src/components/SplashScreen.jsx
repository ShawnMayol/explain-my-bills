import React from "react";
import { OrbitProgress } from "react-loading-indicators";

export default function SplashScreen() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white">
            <div className="flex flex-col items-center gap-6">
                <OrbitProgress
                    variant="disc"
                    color="#facc15"
                    size="medium"
                    textColor="#facc15"
                />
                <p className="text-xl font-semibold text-yellow-300 tracking-wide">
                    Loading...
                </p>
            </div>
        </div>
    );
}
