import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    if (loading) return <SplashScreen />;
    if (user) {
        navigate("/dashboard");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await updateProfile(userCredential.user, {
                displayName: username,
            });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
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
                    Register
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full max-w-[400px] p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20 z-10"
            >
                <input
                    type="text"
                    placeholder="Username"
                    className="mb-4 p-3 rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                />
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
                    autoComplete="new-password"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="mb-4 p-3 rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                />

                {error && (
                    <p className="text-red-500 mb-4 text-center">{error}</p>
                )}

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        className="p-3 text-lg border-2 border-white text-white font-semibold rounded-xl hover:bg-gray-100 hover:text-black transition w-full mb-4 hover:cursor-pointer"
                    >
                        Sign Up
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
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="font-semibold underline text-yellow-300 hover:text-yellow-400 transition"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
