import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { HiOutlineMenu, HiUser, HiMail, HiCalendar, HiCog, HiLogout } from "react-icons/hi";

export default function ProfilePage() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({
        name: "Loading...",
        email: "Loading...",
        joinDate: "Loading...",
        avatar: null
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                // Get user's display name or email as fallback
                const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || "User";
                
                // Format join date
                const joinDate = currentUser.metadata.creationTime ? 
                    new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                    }) : "Unknown";

                setUser({
                    name: displayName,
                    email: currentUser.email || "No email",
                    joinDate: joinDate,
                    avatar: currentUser.photoURL || null
                });
            } else {
                // User is not authenticated, redirect to login
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

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

            <div className="absolute top-0 left-0 right-0 z-30 md:hidden bg-black/10 flex items-center h-12 px-4 py-7">
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <div className="md:ml-[20%] flex-1 flex flex-col p-4 sm:p-6 pt-16 sm:pt-20 md:pt-6 overflow-y-auto">
                {/* Profile Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile</h1>
                    <p className="text-sm sm:text-base text-gray-400">Manage your account settings and preferences</p>
                </div>

                <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
                    {/* Profile Information Card */}
                    <div className="bg-[#2A2B32] rounded-lg p-4 sm:p-6 border border-gray-700">
                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                            <HiUser className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                            Profile Information
                        </h2>
                        
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0 order-1 lg:order-none">
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt="Profile" 
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-yellow-300"
                                    />
                                ) : (
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                        <HiUser className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                    </div>
                                )}
                            </div>
                            
                            {/* User Details */}
                            <div className="flex-1 space-y-3 sm:space-y-4 w-full order-2 lg:order-none">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                        <div className="bg-[#1B1C21] rounded-lg p-2 sm:p-3 border border-gray-600">
                                            <span className="text-sm sm:text-base text-white break-words">{user.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                        <div className="bg-[#1B1C21] rounded-lg p-2 sm:p-3 border border-gray-600 flex items-center gap-2">
                                            <HiMail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm sm:text-base text-white break-all">{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">Member Since</label>
                                    <div className="bg-[#1B1C21] rounded-lg p-2 sm:p-3 border border-gray-600 flex items-center gap-2">
                                        <HiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm sm:text-base text-white">{user.joinDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings Card */}
                    <div className="bg-[#2A2B32] rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <HiCog className="w-5 h-5 text-yellow-300" />
                            Account Settings
                        </h2>
                        
                        <div className="space-y-4">
                            <Link
                                to="/profile/edit-username"
                                className="flex items-center justify-between p-4 bg-[#1B1C21] rounded-lg border border-gray-600 hover:border-yellow-300 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-300/10 rounded-lg flex items-center justify-center">
                                        <HiUser className="w-5 h-5 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">Edit Username</h3>
                                        <p className="text-sm text-gray-400">Change your display name</p>
                                    </div>
                                </div>
                                <div className="text-gray-400 group-hover:text-yellow-300 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>

                            <Link
                                to="/profile/change-password"
                                className="flex items-center justify-between p-4 bg-[#1B1C21] rounded-lg border border-gray-600 hover:border-yellow-300 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-300/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">Change Password</h3>
                                        <p className="text-sm text-gray-400">Update your account password</p>
                                    </div>
                                </div>
                                <div className="text-gray-400 group-hover:text-yellow-300 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-[#2A2B32] rounded-lg p-6 border border-red-500/20">
                        <h2 className="text-xl font-semibold text-red-400 mb-6 flex items-center gap-2">
                            <HiLogout className="w-5 h-5" />
                            Account Actions
                        </h2>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors w-full text-left"
                        >
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <HiLogout className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-red-400">Sign Out</h3>
                                <p className="text-sm text-gray-400">Sign out of your account</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}