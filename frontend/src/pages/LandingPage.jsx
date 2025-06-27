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
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <div>
                <p className="text-2xl mb-2 text-start">
                    {user
                        ? `Welcome Back, ${user.displayName || user.email}!`
                        : "Welcome!"}
                </p>
                <h1 className="text-7xl font-bold mb-14">Explain My Bills!</h1>
            </div>

            <div>
                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            className="rounded-xl p-3 text-lg border-2 font-semibold mr-10 px-12 hover:cursor-pointer"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="rounded-xl p-3 text-lg border-2 font-semibold px-12 hover:cursor-pointer"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/signup"
                            className="rounded-xl p-3 text-lg border-2 font-semibold mr-10 px-12 hover:cursor-pointer"
                        >
                            Sign Up
                        </Link>
                        <Link
                            to="/signin"
                            className="rounded-xl p-3 text-lg border-2 font-semibold px-12 hover:cursor-pointer"
                        >
                            Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
