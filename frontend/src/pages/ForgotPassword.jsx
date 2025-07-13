import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";

export default function ForgotPassword() {
    const { loading, user } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    if (loading) return <SplashScreen />;
    if (user) {
        navigate("/dashboard");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address");
            return;
        }

        setIsSubmitting(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Please check your inbox.");
            setEmail("");
        } catch (err) {
            console.error("Error sending password reset email:", err);
            setError(
                "Failed to send password reset email. Please check if the email is correct."
            );
        } finally {
            setIsSubmitting(false);
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
                    Forgot Password?
                </h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full max-w-[400px] p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/10 border border-white/20 z-10"
            >
                <p className="text-gray-300 mb-4 text-sm">
                    Enter your email address and we'll send you a link to reset
                    your password.
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    className="mb-4 p-3 rounded-xl bg-zinc-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                {error && (
                    <p className="text-red-500 mb-4 text-center">{error}</p>
                )}

                {message && (
                    <p className="text-green-500 mb-4 text-center">{message}</p>
                )}

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`p-3 text-lg border-2 border-white text-white font-semibold rounded-xl transition w-full mb-4 ${
                            isSubmitting
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-gray-100 hover:text-black hover:cursor-pointer"
                        }`}
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </button>

                    <p className="text-sm text-gray-300">
                        Remember your password?{" "}
                        <Link
                            to="/signin"
                            className="font-semibold underline text-yellow-300 hover:text-yellow-400 transition"
                        >
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
