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
        <div className="w-1/5 min-w-[180px] border-r p-8 flex flex-col justify-between">
            <div>
                <div className="mb-10">
                    <p className="font-bold text-sm">Explain My Bills!</p>
                    <p className="text-xs text-gray-500">{today}</p>
                </div>
                <div className="mb-10">
                    <h2 className="text-xl font-semibold mb-10">
                        Hello, {user?.displayName || user?.email || "User"}!
                    </h2>
                    <nav className="flex flex-col space-y-3">
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
                className="text-sm font-semibold underline text-left hover:cursor-pointer"
            >
                Sign-out
            </button>
        </div>
    );
}
