import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <h1 className="text-7xl font-bold mb-14">Explain My Bills!</h1>
            <div>
                <Link to="/signup" className="rounded-xl p-3 text-lg border-2 font-semibold mr-10 px-12 hover:cursor-pointer">Sign Up</Link>
                <Link to="/signin" className="rounded-xl p-3 text-lg border-2 font-semibold px-12 hover:cursor-pointer">Sign In</Link>
            </div>
        </div>
    );
}
