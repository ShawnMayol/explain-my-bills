import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Manila",
    });

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="w-1/5 min-w-[180px] border-r border-r-black shadow-2xl p-8 flex flex-col justify-between bg-[#1E1F24] z-10">
            <div>
                <div className="mb-23 flex items-center space-x-5">
                    <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                    <p className="font-bold text-l">Explain My Bills!</p>
                </div>
                <div className="mb-10">
                    <nav className="flex flex-col space-y-5 text-yellow-300">
                        <Link
                            to="/dashboard"
                            className="font-semibold hover:underline"
                        >
                            Home
                        </Link>
                        <Link
                            to="/analytics"
                            className="font-semibold hover:underline"
                        >
                            Analytics
                        </Link>
                        <Link
                            to="/notifications"
                            className="font-semibold hover:underline"
                        >
                            Notifications
                        </Link>
                        <Link
                            to="/bills"
                            className="font-semibold hover:underline"
                        >
                            Bills
                        </Link>
                        <Link
                            to="/profile"
                            className="font-semibold hover:underline"
                        >
                            Profile
                        </Link>
                    </nav>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="text-sm font-semibold text-left text-yellow-300 hover:cursor-pointer"
            >
                Sign-out
            </button>
        </div>
    );
}
