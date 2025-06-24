import React from "react";
import { Link } from "react-router-dom";

export default function SignIn() {
    return (
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <p className="text-2xl mb-2">Explain My Bills!</p>
            <h1 className="text-7xl font-bold">Login</h1>
            <form className="flex flex-col mt-10 w-1/4">
                <input
                    type="text"
                    placeholder="Username"
                    className="mb-5 p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="mb-5 p-2 border rounded"
                />
                <div className="flex gap-5 text-center">
                    <Link
                        to="/signin"
                        type="submit"
                        className="p-3 text-lg border-2 font-semibold rounded-4xl hover:cursor-pointer w-1/2"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        type="submit"
                        className="p-3 text-lg border-2 font-semibold rounded-4xl hover:cursor-pointer w-1/2"
                    >
                        Sign Up
                    </Link>
                </div>
            </form>
        </div>
    );
}
