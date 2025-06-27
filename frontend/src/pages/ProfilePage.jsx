import React from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
        <div className="flex h-screen w-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6 w-[350px]">
                    <Link
                        to="/profile/edit-username"
                        className="w-full py-3 border rounded-full font-semibold hover:bg-gray-50 transition text-center"
                    >
                        Edit Username
                    </Link>
                    <Link
                        to="/profile/change-password"
                        className="w-full py-3 border rounded-full font-semibold hover:bg-gray-50 transition text-center"
                    >
                        Change Password
                    </Link>
                    <button
                        className="w-full py-3 border rounded-full font-semibold hover:bg-gray-50 transition hover:cursor-pointer"
                        onClick={handleLogout}
                    >
                        Sign-out
                    </button>
                </div>
            </div>
        </div>
    );
}
