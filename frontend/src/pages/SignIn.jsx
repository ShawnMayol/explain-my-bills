import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <p className="text-2xl mb-2">Explain My Bills!</p>
            <h1 className="text-7xl font-bold">Login</h1>

            <form onSubmit={handleSubmit} className="flex flex-col mt-10 w-1/4">
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

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        className="p-3 text-lg border-2 font-semibold rounded-4xl hover:cursor-pointer w-full mb-4"
                    >
                        Sign In
                    </button>
                    <p className="text-sm">
                        Don’t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold underline text-blue-600"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
