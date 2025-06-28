import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";

export default function LandingPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white overflow-hidden">
            <div className="absolute right-1/5 top-1/6 w-[450px] h-[450px] rounded-full bg-gray-100 opacity-10 blur-3xl pointer-events-none z-0"></div>
            {/* <div className="absolute left-1/5 bottom-1/6 w-[250px] h-[250px] rounded-full bg-gray-100 opacity-10 blur-3xl pointer-events-none z-0"></div> */}
            
            <div className="z-10">
                <p className="text-2xl mb-2 text-start font-semibold">
                    <span className="text-yellow-300">
                        {user ? "Welcome Back" : "Welcome"}
                    </span>
                    {user && (
                        <span className="text-white">{`, ${user.displayName}!`}</span>
                    )}
                    {!user && <span className="text-white">!</span>}
                </p>
                <h1 className="text-7xl font-bold mb-14">
                    Explain My Bills!
                </h1>
            </div>

            <div className="z-10">
                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            className="rounded-xl p-3 text-lg border-2 border-white text-white font-semibold mr-10 px-12 hover:bg-gray-100 hover:text-black transition"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="rounded-xl p-3 text-lg border-2 border-white text-white font-semibold px-12 hover:bg-gray-100 hover:text-black transition hover:cursor-pointer"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/signup"
                            className="rounded-xl p-3 text-lg border-2 border-white text-white font-semibold mr-10 px-12 hover:bg-gray-100 hover:text-black transition"
                        >
                            Sign Up
                        </Link>
                        <Link
                            to="/signin"
                            className="rounded-xl p-3 text-lg border-2 border-white text-white font-semibold px-12 hover:bg-gray-100 hover:text-black transition"
                        >
                            Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
