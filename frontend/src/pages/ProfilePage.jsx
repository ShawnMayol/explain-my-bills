import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { HiOutlineMenu } from "react-icons/hi";

export default function ProfilePage() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#1B1C21] text-white overflow-hidden relative">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Top Bar Mobile */}
            <div className="absolute top-0 left-0 right-0 z-30 md:hidden bg-black/10 flex items-center h-12 px-4 py-7">
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6 w-full max-w-[350px]">
                    <Link
                        to="/profile/edit-username"
                        className="w-full py-3 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition text-center"
                    >
                        Edit Username
                    </Link>
                    <Link
                        to="/profile/change-password"
                        className="w-full py-3 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition text-center"
                    >
                        Change Password
                    </Link>
                    <button
                        className="w-full py-3 border-2 border-white rounded-full font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer"
                        onClick={handleLogout}
                    >
                        Sign-out
                    </button>
                </div>
            </div>
        </div>
    );
}
