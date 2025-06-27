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
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            <div className="bg-white px-12 py-10 rounded-lg flex flex-col items-center min-w-[400px] shadow">
                <h1 className="text-3xl font-bold mb-8">Edit Username</h1>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center gap-5 w-full"
                >
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border rounded p-2 text-center text-lg"
                        placeholder="Enter new username"
                    />
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
                            className="border rounded-full px-7 py-2 font-semibold hover:bg-gray-50 transition"
                        >
                            Save
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
