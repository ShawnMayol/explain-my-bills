import React from "react";

export default function LandingPage() {
    return (
        <div className="h-screen w-screen items-center flex flex-col justify-center">
            <h1 className="text-7xl text-center font-bold mb-9">Explain My Bills!</h1>
            <div>
                <button className="rounded-xl p-3 text-lg border-2 font-semibold mr-10 px-12 hover:cursor-pointer">Sign Up</button>
                <button className="rounded-xl p-3 text-lg border-2 font-semibold px-12 hover:cursor-pointer">Sign In</button>
            </div>
        </div>
    );
}
