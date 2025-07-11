import React from "react";
import Sidebar from "../components/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";
import toast from "react-hot-toast";

export default function Test() {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const showSuccessToast = () => {
        toast.success("This is a success toast!");
    };

    const showErrorToast = () => {
        toast.error("This is an error toast!");
    };

    const showLoadingToast = () => {
        const loadingToast = toast.loading("Loading...");

        // Simulate an API call
        setTimeout(() => {
            toast.dismiss(loadingToast);
            toast.success("Loading complete!");
        }, 3000);
    };

    const showCustomToast = () => {
        toast("This is a custom toast!", {
            icon: "🔥",
            style: {
                background: "#FFD700",
                color: "#000",
            },
        });
    };

    const showPromiseToast = () => {
        const promise = new Promise((resolve, reject) => {
            // Simulate an API call
            setTimeout(() => {
                // Randomly resolve or reject
                if (Math.random() > 0.5) {
                    resolve("API call successful!");
                } else {
                    reject(new Error("API call failed!"));
                }
            }, 3000);
        });

        toast.promise(promise, {
            loading: "Processing...",
            success: (data) => data,
            error: (err) => err.message,
        });
    };

    return (
        <div className="flex min-h-screen w-full bg-[#1B1C21] text-white overflow-y-auto overflow-x-hidden relative">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="absolute top-0 left-0 right-0 z-30 md:hidden bg-black/10 flex items-center h-12 px-4 py-7">
                <button
                    className="text-yellow-300 hover:text-white cursor-pointer ps-5"
                    onClick={() => setSidebarOpen(true)}
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <div className="md:ml-[20%] flex-1 px-4 md:px-10 pt-16 md:pt-10 relative">
                <h1 className="text-3xl font-bold mb-8 text-yellow-300">
                    React Hot Toast Test
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="bg-zinc-900 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">
                            Basic Toasts
                        </h2>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={showSuccessToast}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition"
                            >
                                Show Success Toast
                            </button>

                            <button
                                onClick={showErrorToast}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition"
                            >
                                Show Error Toast
                            </button>

                            <button
                                onClick={showLoadingToast}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
                            >
                                Show Loading Toast
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">
                            Advanced Toasts
                        </h2>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={showCustomToast}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md transition"
                            >
                                Show Custom Toast
                            </button>

                            <button
                                onClick={showPromiseToast}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition"
                            >
                                Show Promise Toast
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-zinc-900 rounded-lg border border-gray-700 max-w-4xl">
                    <h2 className="text-xl font-semibold mb-4">
                        Usage Examples
                    </h2>

                    <div className="bg-zinc-800 p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                            {`// Import toast
import toast from 'react-hot-toast';

// Success toast
toast.success('Successfully created!');

// Error toast
toast.error('Failed to fetch data.');

// Loading toast
const loadingToast = toast.loading('Uploading...');
// Dismiss when done
toast.dismiss(loadingToast);

// Promise toast
toast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Data saved!',
    error: 'Could not save data.',
  }
);

// Custom toast
toast('Hello World', {
  icon: '👏',
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
});`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
