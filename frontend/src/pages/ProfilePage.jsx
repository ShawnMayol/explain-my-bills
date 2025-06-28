import React from "react";
import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function ProfilePage() {
    const navigate = useNavigate();

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
            {/* <div className="absolute -right-1/4 w-[950px] h-[950px] rounded-full bg-gray-100 opacity-2 blur-3xl pointer-events-none z-0"></div> */}
            <Sidebar />

            <div className="ml-[20%] flex-1 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6 w-[350px]">
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
