import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function BillResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const billData = location.state?.billData;
    const file = location.state?.file;

    const [imgUrl, setImgUrl] = useState(null);

    useEffect(() => {
        if (!billData || !file) {
            navigate("/bill/summarization", { replace: true });
            return;
        }
        const url = URL.createObjectURL(file);
        setImgUrl(url);

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [billData, file, navigate]);

    if (!billData || !file) return null;

    // Format highlights for textarea
    const highlightStr = Array.isArray(billData.highlights)
        ? billData.highlights
              .map((h) =>
                  typeof h === "string"
                      ? h
                      : Object.entries(h)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")
              )
              .join("\n")
        : "";

    return (
        <div className="flex h-screen w-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-5xl flex flex-col">
                    <span className="mb-3 text-gray-500 font-semibold">
                        Summarized Bill Result
                    </span>
                    <div className="flex gap-10 items-start bg-white rounded-lg shadow p-10">
                        {/* Image */}
                        <div>
                            <div className="w-[300px] h-[340px] bg-gray-100 border rounded-lg flex items-center justify-center mb-4">
                                {imgUrl ? (
                                    <img
                                        src={imgUrl}
                                        alt="bill"
                                        className="object-contain h-full rounded"
                                    />
                                ) : (
                                    <span className="text-gray-400">
                                        No Image
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="mb-4">
                                <div className="mb-2">
                                    <b>Bill Type:</b>{" "}
                                    <span className="font-semibold">
                                        {billData.billType || "—"}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <b>Issuer:</b>{" "}
                                    <span className="font-semibold">
                                        {billData.issuer || "—"}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <b>Total:</b>{" "}
                                    <span className="font-semibold">
                                        {billData.totalBill !== undefined
                                            ? `Php ${billData.totalBill.toLocaleString(
                                                  "en-PH",
                                                  {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                  }
                                              )}`
                                            : "—"}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <b>Bill Date:</b>{" "}
                                    <span className="font-semibold">
                                        {billData.billDate || "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <b>Explanation:</b>
                                <textarea
                                    className="w-full mt-1 mb-2 border rounded bg-gray-50 px-4 py-2 text-gray-500 font-semibold"
                                    value={billData.explanation || ""}
                                    readOnly
                                    rows={3}
                                    style={{ resize: "none" }}
                                />
                            </div>
                            <div className="mb-4">
                                <b>Highlights:</b>
                                <textarea
                                    className="w-full mt-1 mb-2 border rounded bg-gray-50 px-4 py-2 text-gray-500 font-semibold"
                                    value={highlightStr}
                                    readOnly
                                    rows={2}
                                    style={{ resize: "none" }}
                                />
                            </div>
                            <div className="mb-6">
                                <b>Discrepancies:</b>{" "}
                                <span className="font-semibold">
                                    {billData.discrepancies || "None"}
                                </span>
                            </div>
                            <div className="flex gap-8 justify-end mt-6">
                                <button
                                    className="w-32 py-2 border rounded-full font-semibold hover:bg-gray-100 transition"
                                    disabled
                                    title="Save feature coming soon"
                                >
                                    Save
                                </button>
                                <button
                                    className="w-32 py-2 border rounded-full font-semibold hover:bg-gray-100 transition"
                                    disabled
                                    title="Delete feature coming soon"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
