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
    HiX,
} from "react-icons/hi";
import logo from "../assets/logo.svg";

export default function Sidebar({ isOpen, onClose }) {
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
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 z-40
                    bg-[#1E1F24] border-r border-black shadow-2xl
                    px-4 py-8 flex flex-col justify-between
                    w-3/4 md:w-1/5 md:min-w-[180px]
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    md:translate-x-0
                    min-h-screen
                `}
            >
                <div className="flex justify-between items-center md:hidden mb-6">
                    <span className="text-xl font-extrabold text-yellow-300">
                        Menu
                    </span>
                    <button
                        onClick={onClose}
                        className="text-yellow-300 hover:text-white"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col flex-grow justify-between">
                    <div>
                        <div className="flex items-center mb-10">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-extrabold text-2xl shadow">
                                <img src={logo} alt="Explain My Bills Logo" />
                            </div>
                            <span className="ml-4 text-xl font-extrabold text-yellow-300 tracking-wide drop-shadow hidden md:inline">
                                Explain My Bills!
                            </span>
                        </div>

                        {user && (
                            <div className="ml-1 mb-1 text-lg text-white font-semibold">
                                Hello, {user.displayName || "User"}!
                            </div>
                        )}
                        <div className="ml-1 mb-6 text-sm text-gray-400">
                            {today}
                        </div>

                        <nav className="flex flex-col gap-1">
                            {links.map(({ to, icon, label }) => (
                                <NavLink
                                    to={to}
                                    key={to}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center py-2 px-3 rounded-lg text-sm transition font-semibold
                                        ${
                                            isActive
                                                ? "bg-yellow-300 text-black shadow"
                                                : "text-yellow-300 hover:bg-yellow-300/10 hover:text-white"
                                        }`
                                    }
                                    onClick={onClose}
                                >
                                    {icon}
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 mt-10 py-2 px-3 rounded-lg font-semibold text-yellow-300 hover:bg-red-500 hover:text-white transition text-sm cursor-pointer"
                    >
                        <HiOutlineLogout className="w-5 h-5" />
                        Sign-out
                    </button> */}
                </div>
            </aside>
        </>
    );
}
