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
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <p className="text-2xl mb-2">Explain My Bills!</p>
            <h1 className="text-7xl font-bold">Login</h1>

            <form onSubmit={handleSubmit} className="flex flex-col mt-10 w-1/4">
                <input
                    type="email"
                    placeholder="Email"
                    className="mb-5 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="mb-5 p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        className="p-3 text-lg border-2 font-semibold rounded-4xl hover:cursor-pointer w-full mb-4"
                    >
                        Sign In
                    </button>

                    <div className="flex items-center w-full mb-4">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="mx-4 text-gray-500 font-medium text-sm">
                            OR
                        </span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="flex items-center justify-center gap-3 p-3 text-lg border-2 font-semibold rounded-4xl hover:cursor-pointer w-full mb-6"
                    >
                        <FcGoogle className="w-6 h-6" />
                        Continue with Google
                    </button>

                    <p className="text-sm">
                        Don’t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold underline text-blue-600"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
