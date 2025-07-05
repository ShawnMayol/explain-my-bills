import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function EditUsername() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.displayName || "");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        try {
            await updateProfile(auth.currentUser, {
                displayName: username.trim(),
            });
            setSuccess("Username updated!");
            setTimeout(() => navigate("/profile"), 1000); // redirect after 1 second
        } catch (err) {
            setError("Failed to update username.");
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
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-600 rounded-xl p-3 bg-zinc-900 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        placeholder="Enter new username"
                    />
                    <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
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
                            Save
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
