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

    // For form fields
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Detect if user signed in with Google
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
            // Re-authenticate first (Firebase requires this for sensitive operations)
            const credential = EmailAuthProvider.credential(
                user.email,
                oldPassword
            );
            await reauthenticateWithCredential(user, credential);
            // Update password
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
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            <div className="bg-white px-12 py-10 rounded-lg flex flex-col items-center min-w-[400px] shadow">
                <h1 className="text-3xl font-bold mb-8">Change Password</h1>
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
                                className="w-full border rounded p-2 text-center text-lg"
                                placeholder="Old Password"
                                autoComplete="current-password"
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border rounded p-2 text-center text-lg"
                                placeholder="New Password"
                                autoComplete="new-password"
                            />
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) =>
                                    setConfirmNewPassword(e.target.value)
                                }
                                className="w-full border rounded p-2 text-center text-lg"
                                placeholder="Confirm New Password"
                                autoComplete="new-password"
                            />
                        </>
                    )}

                    <div className="flex gap-4 mt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="border rounded-full px-7 py-2 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isGoogle}
                            className="border rounded-full px-7 py-2 font-semibold hover:bg-gray-50 transition"
                        >
                            Confirm
                        </button>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    {success && (
                        <div className="text-green-600 text-sm mt-2">
                            {success}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
