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
import { HiEye, HiEyeOff } from "react-icons/hi";
import toast from "react-hot-toast";
import { ThreeDot } from "react-loading-indicators";

export default function SignIn() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

    if (loading) return <SplashScreen />;
    if (user) {
        navigate("/dashboard");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (!password.trim()) {
            toast.error("Please enter your password.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Signed in successfully!", {
                style: { fontSize: "16px" },
            });
            navigate("/dashboard");
        } catch (err) {
            console.error("Sign in error:", err.code, err.message);

            switch (err.code) {
                case "auth/invalid-email":
                    toast.error("Invalid email format.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/user-not-found":
                    toast.error("No account found with this email.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/wrong-password":
                    toast.error("Incorrect password.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/too-many-requests":
                    toast.error(
                        "Too many failed attempts. Please try again later.",
                        {
                            style: { fontSize: "16px" },
                        }
                    );
                    break;
                case "auth/user-disabled":
                    toast.error("This account has been disabled.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/network-request-failed":
                    toast.error(
                        "Network error. Please check your connection.",
                        {
                            style: { fontSize: "16px" },
                        }
                    );
                    break;
                default:
                    toast.error("Failed to sign in. Please try again.", {
                        style: { fontSize: "16px" },
                    });
            }
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleSubmitting(true);

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success("Signed in with Google successfully!", {
                style: { fontSize: "16px" },
            });
            navigate("/dashboard");
        } catch (err) {
            console.error("Google sign in error:", err.code, err.message);

            // Handle specific Google sign-in errors
            switch (err.code) {
                case "auth/popup-closed-by-user":
                    toast.error("Sign-in canceled. Please try again.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/popup-blocked":
                    toast.error(
                        "Pop-up blocked by browser. Please allow pop-ups for this site.",
                        {
                            style: { fontSize: "16px" },
                        }
                    );
                    break;
                case "auth/cancelled-popup-request":
                    toast.error("Multiple pop-up requests. Please try again.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/account-exists-with-different-credential":
                    toast.error(
                        "An account already exists with the same email but different sign-in credentials.",
                        {
                            style: { fontSize: "16px" },
                        }
                    );
                    break;
                default:
                    toast.error("Google sign-in failed. Please try again.", {
                        style: { fontSize: "16px" },
                    });
            }
            setIsGoogleSubmitting(false);
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
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="p-3 w-full rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
                            <HiEyeOff size={20} />
                        ) : (
                            <HiEye size={20} />
                        )}
                    </button>
                </div>
                <Link
                    to="/forgot-password"
                    className="text-sm text-end text-gray-300 hover:text-yellow-300 transition mb-4 mt-1"
                >
                    Forgot Password?
                </Link>

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`p-3 h-12 text-lg border-2 border-white text-white font-semibold rounded-xl transition w-full mb-4 flex items-center justify-center ${
                            isSubmitting
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-gray-100 hover:text-black hover:cursor-pointer"
                        }`}
                    >
                        <div className="flex items-center justify-center h-full">
                            {isSubmitting ? (
                                <ThreeDot
                                    color="#fde047"
                                    size="small"
                                    text=""
                                    textColor=""
                                />
                            ) : (
                                <span className="leading-none">Sign In</span>
                            )}
                        </div>
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
                        disabled={isGoogleSubmitting}
                        className={`flex items-center justify-center gap-3 p-3 h-12 text-lg border-2 border-white text-white font-semibold rounded-xl transition w-full mb-6 ${
                            isGoogleSubmitting
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-gray-100 hover:text-black hover:cursor-pointer"
                        }`}
                    >
                        <div className="flex items-center justify-center h-full gap-2">
                            {isGoogleSubmitting ? (
                                <ThreeDot
                                    color="#fde047"
                                    size="small"
                                    text=""
                                    textColor=""
                                />
                            ) : (
                                <>
                                    <FcGoogle className="w-6 h-6" />
                                    <span className="leading-none">
                                        Continue with Google
                                    </span>
                                </>
                            )}
                        </div>
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
