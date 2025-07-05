import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (loading) return <SplashScreen />;
    if (user) {
        navigate("/dashboard");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password.");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/dashboard");
        } catch (err) {
            setError("Google sign-in failed.");
            console.error(err);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white px-4">
            <div className="absolute right-1/6 top-1/6 w-[350px] h-[350px] rounded-full bg-gray-100 opacity-10 blur-3xl pointer-events-none z-0"></div>
            <div className="absolute left-1/4 bottom-1/6 w-[150px] h-[150px] rounded-full bg-gray-100 opacity-10 blur-3xl pointer-events-none z-0"></div>

            <div className="mb-6 text-center">
                <p className="text-lg md:text-xl mb-2 text-yellow-300 font-semibold">
                    Explain My Bills!
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                    Login
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full max-w-[400px] p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/10 border border-white/20 z-10"
            >
                <input
                    type="email"
                    placeholder="Email"
                    className="mb-4 p-3 rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="mb-4 p-3 rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                {error && (
                    <p className="text-red-500 mb-4 text-center">{error}</p>
                )}

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        className="p-3 text-lg border-2 border-white text-white font-semibold rounded-xl hover:bg-gray-100 hover:text-black transition w-full mb-4 hover:cursor-pointer"
                    >
                        Sign In
                    </button>

                    <div className="flex items-center w-full mb-4">
                        <hr className="flex-grow border-t border-gray-400" />
                        <span className="mx-4 text-gray-400 font-medium text-sm">
                            OR
                        </span>
                        <hr className="flex-grow border-t border-gray-400" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="flex items-center justify-center gap-3 p-3 text-lg border-2 border-white text-white font-semibold rounded-xl hover:bg-gray-100 hover:text-black transition w-full mb-6 hover:cursor-pointer"
                    >
                        <FcGoogle className="w-6 h-6" />
                        Continue with Google
                    </button>

                    <p className="text-sm text-gray-300">
                        Don’t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold underline text-yellow-300 hover:text-yellow-400 transition"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
