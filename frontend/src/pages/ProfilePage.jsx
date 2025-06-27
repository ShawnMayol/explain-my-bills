import React from "react";
import Sidebar from "../components/Sidebar";

export default function ProfilePage() {
    return (
        <div className="flex h-screen w-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6 w-[350px]">
                    <button className="w-full py-3 border rounded-full font-semibold hover:bg-gray-50 transition">
                        Edit Username
                    </button>
                    <button className="w-full py-3 border rounded-full font-semibold hover:bg-gray-50 transition">
                        Change Password
                    </button>
                    <button className="w-full py-3 border rounded-full font-semibold hover:bg-gray-50 transition">
                        Sign-out
                    </button>
                </div>
            </div>
        </div>
    );
}
