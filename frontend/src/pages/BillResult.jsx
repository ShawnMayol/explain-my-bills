import React, { useEffect, useState, useContext, useRef } from "react";
import {
  useLocation,
  useNavigate,
  UNSAFE_NavigationContext,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import toast, { Toaster } from "react-hot-toast";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";

const API_URL = "explain-my-bills.up.railway.app";

function usePrompt(message, shouldBlockRef) {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    if (!shouldBlockRef.current) return;

    const push = navigator.push;
    navigator.push = (...args) => {
      if (window.confirm(message)) {
        push(...args);
      }
    };
    return () => {
      navigator.push = push;
    };
  }, [message, shouldBlockRef, navigator]);
}

export default function BillResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const billData = location.state?.billData;
  const file = location.state?.file;
  const files = location.state?.files;

  const [imgUrls, setImgUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isBillValid, setIsBillValid] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const shouldBlockRef = useRef(true);

  const promptMsg = "Are you sure you want to leave? You have unsaved changes.";
  useEffect(() => {
    if (!billData) {
      setIsBillValid(false);
      return;
    }
    if (typeof billData.isValidBill === "boolean") {
      setIsBillValid(billData.isValidBill);
    } else {
      const valid =
        !!billData.billType &&
        !!billData.issuer &&
        billData.totalBill !== undefined &&
        !!billData.explanation;
      setIsBillValid(valid);
    }
  }, [billData]);

  useEffect(() => {
    shouldBlockRef.current = true;
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (shouldBlockRef.current) {
        e.preventDefault();
        e.returnValue = promptMsg;
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [promptMsg]);

  usePrompt(promptMsg, shouldBlockRef);

  useEffect(() => {
    if (!billData || (!file && !files)) {
      shouldBlockRef.current = false;
      navigate("/bill/summarization", { replace: true });
      return;
    }

    if (files && files.length > 0) {
      const urls = files.map((f) => URL.createObjectURL(f));
      setImgUrls(urls);
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    } else if (file) {
      const url = URL.createObjectURL(file);
      setImgUrls([url]);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [billData, file, files, navigate]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigateImage = (direction) => {
    if (imgUrls.length <= 1) return;

    if (direction === "prev") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? imgUrls.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === imgUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in to save a bill.");
      return;
    }

    setIsSaving(true);

    try {
      const userId = user.uid;
      const imageId = `bill-${Date.now()}`;
      let imageUrls = [];
      let publicIds = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          const filename = `${currentFile.name.split(".")[0]}_page_${i + 1}`;

          const sigRes = await fetch(`${API_URL}/upload-signature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, filename }),
          });

          const { cloudName, apiKey, timestamp, signature, folder, publicId } =
            await sigRes.json();

          const formData = new FormData();
          formData.append("file", currentFile);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);
          formData.append("folder", folder);
          formData.append("public_id", publicId);

          const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const cloudinaryData = await cloudinaryRes.json();
          imageUrls.push(cloudinaryData.secure_url);
          publicIds.push(cloudinaryData.public_id);
        }
      } else if (file) {
        const filename = file.name.split(".")[0];

        const sigRes = await fetch(`${API_URL}/upload-signature`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, filename }),
        });

        const { cloudName, apiKey, timestamp, signature, folder, publicId } =
          await sigRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("folder", folder);
        formData.append("public_id", publicId);

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const cloudinaryData = await cloudinaryRes.json();
        imageUrls.push(cloudinaryData.secure_url);
        publicIds.push(cloudinaryData.public_id);
      }

      const isMultiPage = Boolean(files && files.length > 1);
      const pageCount = imageUrls.length;

      const billDocRef = doc(
        collection(db, "users", user.uid, "bills"),
        imageId
      );
      await setDoc(billDocRef, {
        ...billData,
        imageId: imageId,
        createdAt: new Date().toISOString(),
        imageUrls: imageUrls,
        publicIds: publicIds,
        imageUrl: imageUrls[0],
        publicId: publicIds[0],
        isMultiPage: isMultiPage,
        pageCount: pageCount,
      });

      toast.success("Bill saved successfully!", { id: "saving" });
      shouldBlockRef.current = false;
      setTimeout(() => {
        window.location.assign("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Failed to save bill:", error);
      toast.error("Failed to save bill. Please try again.", {
        id: "saving",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    shouldBlockRef.current = false;
    setShowDeleteDialog(false);
    window.location.assign("/dashboard");
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  if (!billData || (!file && !files)) return null;

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
    <div className="flex min-h-screen w-full bg-[#1B1C21] text-white overflow-y-auto overflow-x-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`fixed top-0 left-0 right-0 z-30 md:hidden flex items-center h-12 px-4 py-7 transition-colors duration-300 ${
          scrolled ? "bg-black/50" : "bg-black/10"
        }`}
      >
        <button
          className="text-yellow-300 hover:text-white cursor-pointer ps-5"
          onClick={() => setSidebarOpen(true)}
        >
          <HiOutlineMenu className="w-7 h-7" />
        </button>
      </div>
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white text-3xl z-10 rounded-full p-2 transition cursor-pointer"
              onClick={() => setShowImageModal(false)}
              aria-label="Close"
            >
              <HiOutlineX />
            </button>
            <img
              src={imgUrls[currentImageIndex]}
              alt={`bill ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
            {imgUrls.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black text-white rounded-full p-2 transition cursor-pointer"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black text-white rounded-full p-2 transition cursor-pointer"
                  aria-label="Next image"
                >
                  <HiChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/50 text-white rounded text-sm">
                  {currentImageIndex + 1} / {imgUrls.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="w-full md:ml-[20%] flex-1 flex flex-col items-center px-4 md:px-10 py-12 min-h-screen mt-4">
        <div className="w-full max-w-6xl">
          <span className="mb-6 block text-yellow-300 font-semibold text-xl md:text-2xl">
            {isBillValid ? "Summarized Bill Result" : "Invalid Bill"}
          </span>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center">
              <div className="relative w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[300px] xl:max-w-[400px] aspect-square bg-zinc-900 border-2 border-white rounded-lg flex items-center justify-center mb-4">
                {imgUrls.length > 0 ? (
                  <>
                    <img
                      src={imgUrls[currentImageIndex]}
                      alt={`bill ${currentImageIndex + 1}`}
                      className="object-contain h-full w-full rounded cursor-zoom-in"
                      onClick={() => setShowImageModal(true)}
                    />
                    {imgUrls.length > 1 && (
                      <>
                        <button
                          onClick={() => navigateImage("prev")}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 cursor-pointer"
                        >
                          <HiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigateImage("next")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 cursor-pointer"
                        >
                          <HiChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/50 text-white rounded text-sm">
                          {currentImageIndex + 1} / {imgUrls.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
            </div>
            <section className="flex-1 flex flex-col space-y-6 w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 lg:gap-x-12 gap-y-4">
                <InfoItem label="Bill Type" value={billData.billType} />
                {isBillValid && (
                  <>
                    <InfoItem label="Issuer" value={billData.issuer} />
                    <InfoItem
                      label="Total"
                      value={
                        billData.totalBill !== undefined
                          ? `Php ${billData.totalBill.toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "—"
                      }
                    />
                    <InfoItem
                      label="Bill Date"
                      value={
                        billData.billDate
                          ? new Date(billData.billDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "—"
                      }
                    />
                  </>
                )}
              </div>

              <Card title="Explanation" content={billData.explanation} />
              {isBillValid && (
                <>
                  <Card title="Highlights" content={highlightStr || "None"} />
                  <Card
                    title="Discrepancies"
                    content={billData.discrepancies || "None"}
                  />
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 mb-10">
                <button
                  onClick={handleSave}
                  disabled={!isBillValid || isSaving}
                  className={`w-full sm:w-32 py-2 border-2 border-white rounded-full font-semibold text-white transition flex items-center justify-center gap-2 ${
                    isBillValid && !isSaving
                      ? "hover:bg-yellow-300 hover:text-black cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {isSaving && (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {isSaving ? <span>Saving</span> : <span>Save</span>}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-32 py-2 border-2 border-white rounded-full font-semibold text-white hover:bg-red-500 hover:text-white transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />

      <Dialog
        open={showDeleteDialog}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            backgroundColor: "#18181b",
            color: "white",
            border: "1px solid #374151",
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#9ca3af" }}>
            Are you sure you want to discard this bill? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} sx={{ color: "#9ca3af" }}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} sx={{ color: "#ef4444" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <b className="text-yellow-300">{label}:</b>{" "}
      <span className="font-semibold break-words">{value || "—"}</span>
    </div>
  );
}

function Card({ title, content }) {
  return (
    <div>
      <h2 className="text-yellow-300 mb-2 font-semibold">{title}:</h2>
      <div className="w-full border border-white/20 rounded bg-zinc-900 p-4 text-white font-medium max-h-64 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
