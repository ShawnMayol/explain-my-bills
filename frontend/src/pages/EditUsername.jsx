import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function EditUsername() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.displayName || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState("");

    const isValidUsername = (name) => {
        const usernamePattern = /^[a-zA-Z0-9_]+$/;
        return (
            name.trim() !== "" &&
            usernamePattern.test(name) &&
            name.length >= 3 &&
            name.length <= 10
        );
    };

    const hasChanged = username !== user?.displayName;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setValidationError("");

        if (!username.trim()) {
            toast.error("Username cannot be empty.", {
                style: {
                    fontSize: "16px",
                },
            });
            return;
        }

        if (username.length < 3) {
            toast.error("Username must be at least 3 characters.", {
                style: {
                    fontSize: "16px",
                },
            });
            return;
        }

        if (username.length > 10) {
            toast.error("Username cannot exceed 10 characters.", {
                style: {
                    fontSize: "16px",
                },
            });
            return;
        }

        if (!isValidUsername(username)) {
            toast.error(
                "Username can only contain letters, numbers, and underscores.",
                {
                    style: {
                        fontSize: "16px",
                    },
                }
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await updateProfile(auth.currentUser, {
                displayName: username.trim(),
            });

            toast.success("Username updated successfully!", {
                style: {
                    fontSize: "16px",
                },
            });

            setTimeout(() => navigate("/profile"), 1500);
        } catch (err) {
            toast.error("Failed to update username.", {
                style: {
                    fontSize: "16px",
                },
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1B1C21] text-white px-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-6 sm:px-12 py-8 sm:py-10 rounded-3xl flex flex-col items-center w-full max-w-[400px] shadow-2xl">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-yellow-300 text-center">
                    Edit Username
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center gap-5 w-full"
                >
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= 10) {
                                    setUsername(newValue);
                                }

                                if (!newValue.trim()) {
                                    setValidationError(
                                        "Username cannot be empty"
                                    );
                                } else if (newValue.length < 3) {
                                    setValidationError(
                                        "Username must be at least 3 characters"
                                    );
                                } else if (newValue.length > 10) {
                                    setValidationError(
                                        "Username cannot exceed 10 characters"
                                    );
                                } else if (!isValidUsername(newValue)) {
                                    setValidationError(
                                        "Username can only contain letters, numbers, and underscores"
                                    );
                                } else {
                                    setValidationError("");
                                }
                            }}
                            className={`w-full border ${
                                validationError
                                    ? "border-red-500"
                                    : "border-gray-600"
                            } rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:ring-2 ${
                                validationError
                                    ? "focus:ring-red-500"
                                    : "focus:ring-yellow-300"
                            }`}
                            placeholder="Enter new username"
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
                    <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="flex-1 border-2 border-white rounded-full px-7 py-2 font-semibold text-white hover:bg-yellow-300 hover:text-black transition hover:cursor-pointer"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 border-2 border-white rounded-full px-7 py-2 font-semibold text-white transition ${
                                isSubmitting ||
                                !isValidUsername(username) ||
                                !hasChanged
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:bg-yellow-300 hover:text-black hover:cursor-pointer"
                            }`}
                            disabled={
                                isSubmitting ||
                                !isValidUsername(username) ||
                                !hasChanged
                            }
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
