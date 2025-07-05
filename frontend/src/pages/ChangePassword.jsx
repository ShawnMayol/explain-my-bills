import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isGoogle = user?.providerData.some(
        (p) => p.providerId === "google.com"
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (isGoogle) {
            setError(
                "Password change is unavailable for Google sign-in accounts."
            );
            return;
        }

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
                    {isGoogle ? (
                        <div className="text-center text-red-500 font-medium">
                            You signed in with Google. Password changes are
                            unavailable.
                        </div>
                    ) : (
                        <>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                placeholder="Old Password"
                                autoComplete="current-password"
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                placeholder="New Password"
                                autoComplete="new-password"
                            />
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) =>
                                    setConfirmNewPassword(e.target.value)
                                }
                                className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                placeholder="Confirm New Password"
                                autoComplete="new-password"
                            />
                        </>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="flex-1 border-2 border-white rounded-full px-7 py-2 font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer"
                        >
                            Cancel
                        </button>

                        {!isGoogle && (
                            <button
                                type="submit"
                                disabled={isGoogle}
                                className="flex-1 border-2 border-white rounded-full px-7 py-2 font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer"
                            >
                                Confirm
                            </button>
                        )}
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
