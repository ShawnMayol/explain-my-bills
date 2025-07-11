import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";
import { FcGoogle } from "react-icons/fc";
import { HiEye, HiEyeOff } from "react-icons/hi";
import toast from "react-hot-toast";
import { ThreeDot } from "react-loading-indicators";

export default function SignUp() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    if (loading) return <SplashScreen />;
    if (user) {
        navigate("/dashboard");
        return null;
    }

    const isValidUsername = (name) => {
        const usernamePattern = /^[a-zA-Z0-9_]+$/;
        return (
            name.trim() !== "" &&
            usernamePattern.test(name) &&
            name.length >= 3 &&
            name.length <= 10
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUsernameError("");
        setPasswordError("");

        if (!username.trim()) {
            toast.error("Username cannot be empty.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (username.length < 3) {
            toast.error("Username must be at least 3 characters.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (username.length > 10) {
            toast.error("Username cannot exceed 10 characters.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (!isValidUsername(username)) {
            toast.error(
                "Username can only contain letters, numbers, and underscores.",
                {
                    style: { fontSize: "16px" },
                }
            );
            return;
        }

        if (!email.trim()) {
            toast.error("Email cannot be empty.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (!password.trim()) {
            toast.error("Password cannot be empty.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.", {
                style: { fontSize: "16px" },
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await updateProfile(userCredential.user, {
                displayName: username,
            });

            const successMessages = [
                `Welcome to Explain My Bills, ${username}!`,
                `Account created successfully! Excited to have you with us, ${username}!`,
                `You're all set, ${username}! Let's start summarizing your bills!`,
                `Great to meet you, ${username}! Your account is ready to go!`,
            ];
            const randomMessage =
                successMessages[
                    Math.floor(Math.random() * successMessages.length)
                ];

            toast.success(randomMessage, {
                style: { fontSize: "16px" },
                icon: "👋",
            });
            navigate("/dashboard");
        } catch (err) {
            console.error("Sign up error:", err.code, err.message);

            switch (err.code) {
                case "auth/email-already-in-use":
                    toast.error("Email is already in use.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/invalid-email":
                    toast.error("Invalid email format.", {
                        style: { fontSize: "16px" },
                    });
                    break;
                case "auth/weak-password":
                    toast.error(
                        "Password is too weak. Choose a stronger password.",
                        {
                            style: { fontSize: "16px" },
                        }
                    );
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
                    toast.error("Failed to create account. Please try again.", {
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
            const result = await signInWithPopup(auth, provider);

            const displayName =
                result.user.displayName || result.user.email.split("@")[0];

            const welcomeMessages = [
                `Welcome, ${displayName}!`,
                `Great to see you, ${displayName}!`,
                `Hello, ${displayName}!`,
                `You're in, ${displayName}!`,
                `Welcome aboard, ${displayName}!`,
            ];
            const randomMessage =
                welcomeMessages[
                    Math.floor(Math.random() * welcomeMessages.length)
                ];

            toast.success(randomMessage, {
                style: { fontSize: "16px" },
                icon: "👋",
            });
            navigate("/dashboard");
        } catch (err) {
            console.error("Google sign in error:", err.code, err.message);

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
                    Register
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full max-w-[400px] p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20 z-10"
            >
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className={`w-full p-3 rounded-xl bg-zinc-900 border ${
                            usernameError ? "border-red-500" : "border-gray-600"
                        } text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            usernameError
                                ? "focus:ring-red-500"
                                : "focus:ring-yellow-300"
                        }`}
                        value={username}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length <= 10) {
                                setUsername(newValue);
                            }

                            if (!newValue.trim()) {
                                setUsernameError("Username cannot be empty");
                            } else if (newValue.length < 3) {
                                setUsernameError(
                                    "Username must be at least 3 characters"
                                );
                            } else if (newValue.length > 10) {
                                setUsernameError(
                                    "Username cannot exceed 10 characters"
                                );
                            } else if (!isValidUsername(newValue)) {
                                setUsernameError(
                                    "Username can only contain letters, numbers, and underscores"
                                );
                            } else {
                                setUsernameError("");
                            }
                        }}
                        autoComplete="username"
                        maxLength={10}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        <span
                            className={
                                username.length < 3 || username.length > 10
                                    ? "text-red-400"
                                    : "text-yellow-300"
                            }
                        >
                            {username.length}
                        </span>
                        /10
                    </div>
                    {usernameError && (
                        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-4 py-1.5 rounded shadow-lg max-w-2xl z-10 sm:block hidden text-center w-1/2">
                            {usernameError}
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-red-500"></div>
                        </div>
                    )}
                    {usernameError && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-red-500 text-white text-sm px-3 py-1.5 rounded shadow-lg max-w-xs z-10 sm:hidden block mt-[-10px] text-center w-full">
                            {usernameError}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-red-500"></div>
                        </div>
                    )}
                </div>
                <input
                    type="email"
                    placeholder="Email"
                    className="mb-4 p-3 rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className={`p-3 w-full rounded-xl bg-zinc-900 border ${
                            passwordError ? "border-red-500" : "border-gray-600"
                        } text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            passwordError
                                ? "focus:ring-red-500"
                                : "focus:ring-yellow-300"
                        }`}
                        value={password}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setPassword(newValue);

                            // Real-time validation feedback
                            if (newValue.length > 0 && newValue.length < 6) {
                                setPasswordError(
                                    "Password must be at least 6 characters"
                                );
                            } else {
                                setPasswordError("");
                            }
                        }}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
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
                    {passwordError && (
                        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-4 py-1.5 rounded shadow-lg max-w-2xl z-10 sm:block hidden text-center w-1/2">
                            {passwordError}
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-red-500"></div>
                        </div>
                    )}
                    {passwordError && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-red-500 text-white text-sm px-3 py-1.5 rounded shadow-lg max-w-xs z-10 sm:hidden block mt-[-10px] text-center w-full">
                            {passwordError}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-red-500"></div>
                        </div>
                    )}
                </div>
                <div className="relative mb-4">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="p-3 w-full rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                            showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showConfirmPassword ? (
                            <HiEyeOff size={20} />
                        ) : (
                            <HiEye size={20} />
                        )}
                    </button>
                </div>

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
                                <span className="leading-none">Sign Up</span>
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
