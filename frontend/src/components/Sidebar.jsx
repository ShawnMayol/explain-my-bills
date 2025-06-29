import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import {
    HiOutlineHome,
    HiOutlineChartBar,
    HiOutlineBell,
    HiOutlineDocumentText,
    HiOutlineUserCircle,
    HiOutlineLogout,
} from "react-icons/hi";

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

    const links = [
        {
            to: "/dashboard",
            icon: <HiOutlineHome className="w-5 h-5 mr-3" />,
            label: "Home",
        },
        {
            to: "/analytics",
            icon: <HiOutlineChartBar className="w-5 h-5 mr-3" />,
            label: "Analytics",
        },
        {
            to: "/notifications",
            icon: <HiOutlineBell className="w-5 h-5 mr-3" />,
            label: "Notifications",
        },
        {
            to: "/bills",
            icon: <HiOutlineDocumentText className="w-5 h-5 mr-3" />,
            label: "Bills",
        },
        {
            to: "/profile",
            icon: <HiOutlineUserCircle className="w-5 h-5 mr-3" />,
            label: "Profile",
        },
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-1/5 min-w-[180px] border-r border-r-black shadow-2xl px-4 py-8 flex flex-col bg-[#1E1F24] z-20">
            <div className="flex flex-col items-start mb-10">
                <div className="flex items-center mb-10">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-extrabold text-2xl shadow"></div>
                    <span className="ml-4 text-xl font-extrabold text-yellow-300 tracking-wide drop-shadow">
                        Explain My Bills!
                    </span>
                </div>
                {user && (
                    <div className="ml-1 mb-1 text-lg text-white font-semibold">
                        Hello, {user.displayName ? user.displayName : "User"}!
                    </div>
                )}
                <div className="ml-1 mb-2 text-sm text-gray-400">{today}</div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 flex flex-col gap-1">
                {links.map(({ to, icon, label }) => (
                    <NavLink
                        to={to}
                        key={to}
                        end // Makes exact match
                        className={({ isActive }) =>
                            `flex items-center py-2 px-3 rounded-lg text-sm transition font-semibold
                            ${
                                isActive
                                    ? "bg-yellow-300 text-black shadow"
                                    : "text-yellow-300 hover:bg-yellow-300/10 hover:text-white"
                            }`
                        }
                    >
                        {icon}
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Sign out */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 mt-10 py-2 px-3 rounded-lg font-semibold text-yellow-300 hover:bg-red-500 hover:text-white transition text-sm cursor-pointer"
            >
                <HiOutlineLogout className="w-5 h-5" />
                Sign-out
            </button>
        </aside>
    );
}
