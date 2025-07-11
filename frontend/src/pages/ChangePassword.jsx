import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function ChangePassword() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isGoogle = user?.providerData.some(
        (p) => p.providerId === "google.com"
    );

    useEffect(() => {
        if (isGoogle) {
            window.open(
                "https://myaccount.google.com/security/signinoptions/password",
                "_blank"
            );
            navigate("/profile");
        }
    }, [isGoogle, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                oldPassword
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setSuccess("Password changed successfully!");
            setTimeout(() => navigate("/profile"), 1000);
        } catch (err) {
            if (err.code === "auth/wrong-password") {
                setError("Old password is incorrect.");
            } else {
                setError("Failed to change password. Please try again.");
            }
        }
    };

    const toggleOldPassword = () => {
        setShowOldPassword((prev) => !prev);
    };

    const toggleNewPassword = () => {
        setShowNewPassword((prev) => !prev);
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    if (isGoogle) {
        return null;
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white px-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 sm:px-12 py-8 sm:py-10 rounded-3xl flex flex-col items-center w-full max-w-[400px] shadow-2xl">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-yellow-300 text-center">
                    Change Password
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center gap-5 w-full"
                >
                    <div className="relative w-full">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            placeholder="Old Password"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            aria-label={
                                showOldPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showOldPassword ? (
                                <HiEyeOff size={20} />
                            ) : (
                                <HiEye size={20} />
                            )}
                        </button>
                    </div>
                    <div className="relative w-full">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            placeholder="New Password"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label={
                                showNewPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showNewPassword ? (
                                <HiEyeOff size={20} />
                            ) : (
                                <HiEye size={20} />
                            )}
                        </button>
                    </div>
                    <div className="relative w-full">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) =>
                                setConfirmNewPassword(e.target.value)
                            }
                            className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            placeholder="Confirm New Password"
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

                    <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="flex-1 border-2 border-white rounded-full px-7 py-2 font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="flex-1 border-2 border-white rounded-full px-7 py-2 font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer"
                        >
                            Confirm
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-400 text-sm mt-2">
                            {success}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
