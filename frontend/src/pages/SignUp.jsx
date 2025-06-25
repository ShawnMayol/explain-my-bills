import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/dashboard");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await updateProfile(userCredential.user, {
                displayName: username,
            });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <p className="text-2xl mb-2">Explain My Bills!</p>
            <h1 className="text-7xl font-bold">Register</h1>

            <form onSubmit={handleSubmit} className="flex flex-col mt-10 w-1/4">
                <input
                    type="text"
                    placeholder="Username"
                    className="mb-5 p-2 border rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="mb-5 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="mb-5 p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="mb-5 p-2 border rounded"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        className="p-3 text-lg border-2 font-semibold rounded-4xl hover:cursor-pointer w-full mb-4"
                    >
                        Sign Up
                    </button>
                    <p className="text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="font-semibold underline text-blue-600"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
