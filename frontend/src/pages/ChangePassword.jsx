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
import toast from "react-hot-toast";
import { ThreeDot } from "react-loading-indicators";

export default function ChangePassword() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setValidationError("");

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            toast.error("Please fill in all fields.", {
                style: {
                    fontSize: "16px",
                },
            });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match.", {
                style: {
                    fontSize: "16px",
                },
            });
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.", {
                style: {
                    fontSize: "16px",
                },
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                oldPassword
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            toast.success("Password changed successfully!", {
                style: {
                    fontSize: "16px",
                },
            });
            navigate("/profile");
        } catch (err) {
            if (err.code === "auth/wrong-password") {
                toast.error("Old password is incorrect.", {
                    style: {
                        fontSize: "16px",
                    },
                });
            } else {
                toast.error("Failed to change password. Please try again.", {
                    style: {
                        fontSize: "16px",
                    },
                });
            }
            setIsSubmitting(false);
        }
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
                            className="w-full border border-gray-600 rounded-xl p-3 pr-12 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
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
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setNewPassword(newValue);

                                if (
                                    newValue.length > 0 &&
                                    newValue.length < 6
                                ) {
                                    setValidationError(
                                        "Password must be at least 6 characters"
                                    );
                                } else {
                                    setValidationError("");
                                }
                            }}
                            className={`w-full border ${
                                validationError
                                    ? "border-red-500"
                                    : "border-gray-600"
                            } rounded-xl p-3 pr-12 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                                validationError
                                    ? "focus:ring-red-500"
                                    : "focus:ring-yellow-300"
                            }`}
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
                        {validationError && (
                            <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-4 py-1.5 rounded shadow-lg max-w-2xl z-10 sm:block hidden text-center w-1/2">
                                {validationError}
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-red-500"></div>
                            </div>
                        )}
                        {validationError && (
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-red-500 text-white text-sm px-3 py-1.5 rounded shadow-lg max-w-xs z-10 sm:hidden block mt-[-10px] text-center w-full">
                                {validationError}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-red-500"></div>
                            </div>
                        )}
                    </div>
                    <div className="relative w-full">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) =>
                                setConfirmNewPassword(e.target.value)
                            }
                            className="w-full border border-gray-600 rounded-xl p-3 pr-12 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
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
                            className="flex-1 border-2 border-white rounded-full px-7 py-3 font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer leading-none"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={`flex-1 border-2 border-white rounded-full px-7 py-3 font-semibold text-white transition flex items-center justify-center gap-2 h-12 ${
                                isSubmitting
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:bg-yellow-300 hover:text-black hover:cursor-pointer"
                            }`}
                            disabled={isSubmitting}
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
                                    <span className="leading-none">Save</span>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
