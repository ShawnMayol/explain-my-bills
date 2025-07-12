// TODO: fix camera switching will upload new image instead of replacing
// NOTE: Explanation doesn't explain why the upload is marked invalid
// NOTE: Invalid bills are still able to be uploaded if there is one valid bill

import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ThreeDot } from "react-loading-indicators";
import { HiOutlineMenu } from "react-icons/hi";
import {
    Box,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Alert,
    Fab,
    Avatar,
    Divider,
    Paper,
    Stack,
    Modal,
    Backdrop,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon,
    Upload as UploadIcon,
    Add as AddIcon,
    Image as ImageIcon,
    FlipCameraAndroid as FlipCameraIcon,
    Close as CloseIcon,
} from "@mui/icons-material";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 8;

export default function BillSummarization() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const [flash, setFlash] = useState(false);
    const [expandedPanels, setExpandedPanels] = useState({});
    const [replacingIndex, setReplacingIndex] = useState(null);
    const [cameraLoading, setCameraLoading] = useState(false);

    const fileInputRef = useRef();
    const videoRef = useRef();
    const streamRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        setHasCamera(!!navigator.mediaDevices?.getUserMedia);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleFileChange = (e) => {
        setError("");
        const files = Array.from(e.target.files);

        if (replacingIndex !== null) {
            if (files.length > 0) {
                const file = files[0];

                if (!file.type.startsWith("image/")) {
                    setError("Please select only image files");
                    return;
                }
                if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    setError(
                        `File size must be less than ${MAX_FILE_SIZE_MB}MB`
                    );
                    return;
                }

                const newFile = {
                    file,
                    previewUrl: URL.createObjectURL(file),
                    id: Date.now() + Math.random(),
                };

                setSelectedFiles((prev) => {
                    const newFiles = [...prev];
                    if (newFiles[replacingIndex]?.previewUrl) {
                        URL.revokeObjectURL(
                            newFiles[replacingIndex].previewUrl
                        );
                    }
                    newFiles[replacingIndex] = newFile;
                    return newFiles;
                });

                setReplacingIndex(null);
            }
            return;
        }

        if (selectedFiles.length + files.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed`);
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                setError("Please select only image files");
                return;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
                return;
            }
        }

        const newFiles = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            id: Date.now() + Math.random(),
        }));

        setSelectedFiles((prev) => [...prev, ...newFiles]);
        setCurrentImageIndex(selectedFiles.length);

        if (newFiles.length > 0) {
            const latestIndex = selectedFiles.length + newFiles.length - 1;
            setExpandedPanels((prev) => ({
                ...prev,
                [latestIndex]: true,
            }));
        }
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => {
            const newFiles = prev.filter((_, i) => i !== index);
            if (currentImageIndex >= newFiles.length && newFiles.length > 0) {
                setCurrentImageIndex(newFiles.length - 1);
            } else if (newFiles.length === 0) {
                setCurrentImageIndex(0);
            }
            return newFiles;
        });

        setExpandedPanels((prev) => {
            const newPanels = { ...prev };
            delete newPanels[index];

            const adjustedPanels = {};
            Object.keys(newPanels).forEach((key) => {
                const idx = parseInt(key);
                if (idx > index) {
                    adjustedPanels[idx - 1] = newPanels[key];
                } else {
                    adjustedPanels[key] = newPanels[key];
                }
            });

            return adjustedPanels;
        });
    };

    const addNextPage = () => {
        if (selectedFiles.length >= MAX_FILES) {
            setError(`Maximum ${MAX_FILES} files allowed`);
            return;
        }
        setReplacingIndex(null);
        fileInputRef.current.click();
    };

    const handlePanelChange = (panel) => (event, isExpanded) => {
        setExpandedPanels((prev) => ({
            ...prev,
            [panel]: isExpanded,
        }));
    };

    const handleCameraForItem = (index) => {
        setReplacingIndex(index);
        setCurrentImageIndex(index);
        if (showCamera) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const handleUploadForItem = (index) => {
        setReplacingIndex(index);
        setCurrentImageIndex(index);
        fileInputRef.current.click();
    };

    const startCamera = async () => {
        setError("");
        setCameraLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
            });
            streamRef.current = stream;
            setShowCamera(true);
            setCameraLoading(false);
        } catch (err) {
            console.error(err);
            setError("Unable to access camera");
            setCameraLoading(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setCameraLoading(false);
        setReplacingIndex(null);
    };

    const toggleCamera = () => {
        if (showCamera) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const flipCamera = () => {
        const newMode = facingMode === "environment" ? "user" : "environment";
        setFacingMode(newMode);
        setCameraLoading(true);
        stopCamera();
        setTimeout(() => {
            startCamera();
        }, 200);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                const file = new File(
                    [blob],
                    `camera-capture-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg",
                    }
                );

                const newFile = {
                    file,
                    previewUrl: URL.createObjectURL(file),
                    id: Date.now() + Math.random(),
                };

                if (replacingIndex !== null) {
                    setSelectedFiles((prev) => {
                        const newFiles = [...prev];
                        if (newFiles[replacingIndex]?.previewUrl) {
                            URL.revokeObjectURL(
                                newFiles[replacingIndex].previewUrl
                            );
                        }
                        newFiles[replacingIndex] = newFile;
                        return newFiles;
                    });
                    setReplacingIndex(null);
                } else {
                    if (selectedFiles.length >= MAX_FILES) {
                        setError(`Maximum ${MAX_FILES} files allowed`);
                        return;
                    }

                    setSelectedFiles((prev) => [...prev, newFile]);
                    const newIndex = selectedFiles.length;
                    setCurrentImageIndex(newIndex);

                    setExpandedPanels((prev) => ({
                        ...prev,
                        [newIndex]: true,
                    }));
                }

                stopCamera();
            },
            "image/jpeg",
            0.9
        );
    };

    useEffect(() => {
        const setVideoStream = async () => {
            if (
                showCamera &&
                videoRef.current &&
                streamRef.current &&
                !cameraLoading
            ) {
                try {
                    videoRef.current.srcObject = streamRef.current;
                    await videoRef.current.play();
                } catch (error) {
                    console.error("Error setting video stream:", error);
                }
            }
        };

        setVideoStream();
    }, [showCamera, cameraLoading]);

    const handleUpload = () => {
        if (selectedFiles.length === 0) {
            setError("Please select at least one file");
            return;
        }

        const files = selectedFiles.map((sf) => sf.file);
        navigate("/bill/awaiting", { state: { files } });
    };

    const navigateImage = (direction) => {
        if (selectedFiles.length === 0) return;

        if (direction === "prev") {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedFiles.length - 1 : prev - 1
            );
        } else {
            setCurrentImageIndex((prev) =>
                prev === selectedFiles.length - 1 ? 0 : prev + 1
            );
        }
    };

    return (
        <div className="flex min-h-screen bg-[#1B1C21] text-white relative">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div
                className={`fixed top-0 left-0 right-0 z-30 md:hidden flex items-center h-12 px-4 py-7 transition-colors duration-300 ${
                    scrolled ? "bg-black/50" : "bg-black/10"
                }`}
            >
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-yellow-300 hover:text-white"
                >
                    <HiOutlineMenu className="w-7 h-7" />
                </button>
            </div>

            <main className="md:ml-[20%] flex-1 flex flex-col min-h-screen px-4 md:px-10 mt-16 md:mt-0">
                <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", py: 4 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            color: "#fbbf24",
                            fontWeight: "bold",
                            mb: 1,
                        }}
                    >
                        Bill Summarization
                    </Typography>
                    <Divider
                        sx={{ mb: 4, borderColor: "rgba(255,255,255,0.2)" }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 4,
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{ color: "#d1d5db", mb: 2 }}
                            >
                                Upload Bill
                            </Typography>
                            <List sx={{ color: "#9ca3af", mb: 3 }}>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary={`Max file size: ${MAX_FILE_SIZE_MB}MB per file.`}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText primary="Keep the bill flat & unfolded." />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText primary="Only clear, readable images (JPG, PNG)." />
                                </ListItem>
                            </List>
                            <Typography
                                variant="h6"
                                sx={{ color: "#d1d5db", mb: 2 }}
                            >
                                Multiple Pages
                            </Typography>
                            <List sx={{ color: "#9ca3af", mb: 3 }}>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary={`Upload multiple pages of the same bill (max ${MAX_FILES} files).`}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText primary="Ensure all pages are from the same bill." />
                                </ListItem>
                            </List>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Modal
                                open={showCamera || cameraLoading}
                                onClose={stopCamera}
                                closeAfterTransition
                                BackdropComponent={Backdrop}
                                BackdropProps={{
                                    timeout: 500,
                                    sx: { bgcolor: "rgba(0, 0, 0, 0.9)" },
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: {
                                            xs: "95vw",
                                            sm: "80vw",
                                            md: "60vw",
                                        },
                                        maxWidth: 600,
                                        height: { xs: "70vh", sm: "60vh" },
                                        bgcolor: "#18181b",
                                        borderRadius: 2,
                                        boxShadow: 24,
                                        overflow: "hidden",
                                        outline: "none",
                                    }}
                                >
                                    {cameraLoading ? (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: "#18181b",
                                                borderRadius: 2,
                                            }}
                                        >
                                            <ThreeDot
                                                color="#fbbf24"
                                                size="medium"
                                                text=""
                                                textColor=""
                                            />
                                            <Typography
                                                sx={{
                                                    color: "#9ca3af",
                                                    mt: 2,
                                                    fontSize: "1.1rem",
                                                }}
                                            >
                                                Starting camera...
                                            </Typography>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16,
                                                }}
                                            >
                                                <Fab
                                                    size="small"
                                                    onClick={stopCamera}
                                                    sx={{
                                                        bgcolor:
                                                            "rgba(0,0,0,0.6)",
                                                        color: "white",
                                                        "&:hover": {
                                                            bgcolor:
                                                                "rgba(0,0,0,0.8)",
                                                        },
                                                    }}
                                                >
                                                    <CloseIcon />
                                                </Fab>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Paper
                                            sx={{
                                                position: "relative",
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                bgcolor: "#18181b",
                                            }}
                                        >
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    bgcolor: "white",
                                                    opacity: flash ? 1 : 0,
                                                    transition: "opacity 0.15s",
                                                    pointerEvents: "none",
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16,
                                                }}
                                            >
                                                <Fab
                                                    size="small"
                                                    onClick={stopCamera}
                                                    sx={{
                                                        bgcolor:
                                                            "rgba(0,0,0,0.6)",
                                                        color: "white",
                                                        "&:hover": {
                                                            bgcolor:
                                                                "rgba(0,0,0,0.8)",
                                                        },
                                                    }}
                                                >
                                                    <CloseIcon />
                                                </Fab>
                                            </Box>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 20,
                                                    left: "50%",
                                                    transform:
                                                        "translateX(-50%)",
                                                }}
                                            >
                                                <Fab
                                                    color="primary"
                                                    onClick={capturePhoto}
                                                    sx={{
                                                        bgcolor: "#fbbf24",
                                                        "&:hover": {
                                                            bgcolor: "#f59e0b",
                                                        },
                                                        width: 64,
                                                        height: 64,
                                                    }}
                                                >
                                                    <PhotoCameraIcon
                                                        sx={{ fontSize: 30 }}
                                                    />
                                                </Fab>
                                            </Box>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 20,
                                                    right: 20,
                                                }}
                                            >
                                                <Fab
                                                    size="medium"
                                                    onClick={flipCamera}
                                                    sx={{
                                                        bgcolor:
                                                            "rgba(255,255,255,0.25)",
                                                        "&:hover": {
                                                            bgcolor:
                                                                "rgba(255,255,255,0.4)",
                                                        },
                                                    }}
                                                >
                                                    <FlipCameraIcon />
                                                </Fab>
                                            </Box>
                                        </Paper>
                                    )}
                                </Box>
                            </Modal>

                            {selectedFiles.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ color: "#d1d5db", mb: 2 }}
                                    >
                                        Uploaded Pages ({selectedFiles.length}/
                                        {MAX_FILES})
                                    </Typography>

                                    {selectedFiles.map((fileObj, index) => (
                                        <Accordion
                                            key={fileObj.id}
                                            expanded={
                                                expandedPanels[index] || false
                                            }
                                            onChange={handlePanelChange(index)}
                                            sx={{
                                                bgcolor: "#374151",
                                                color: "white",
                                                mb: 1,
                                                "&:before": { display: "none" },
                                                borderRadius: 1,
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={
                                                    <ExpandMoreIcon
                                                        sx={{ color: "white" }}
                                                    />
                                                }
                                                sx={{ minHeight: 56 }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        mr: 2,
                                                        bgcolor: "#fbbf24",
                                                    }}
                                                >
                                                    <ImageIcon />
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        Page {index + 1}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#9ca3af",
                                                        }}
                                                    >
                                                        {fileObj.file.name}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={
                                                        fileObj.file.size > 0
                                                            ? fileObj.file
                                                                  .size <
                                                              1024 * 1024
                                                                ? `${(
                                                                      fileObj
                                                                          .file
                                                                          .size /
                                                                      1024
                                                                  ).toFixed(
                                                                      1
                                                                  )}KB`
                                                                : `${(
                                                                      fileObj
                                                                          .file
                                                                          .size /
                                                                      1024 /
                                                                      1024
                                                                  ).toFixed(
                                                                      1
                                                                  )}MB`
                                                            : "~0.5MB"
                                                    }
                                                    size="small"
                                                    sx={{
                                                        mr: 1,
                                                        bgcolor: "#6b7280",
                                                        color: "white",
                                                        mt: 1.5,
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile(index);
                                                    }}
                                                    size="small"
                                                    sx={{ color: "#ef4444" }}
                                                >
                                                    <DeleteIcon className="hover:bg-gray-600 rounded-full" />
                                                </IconButton>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            position:
                                                                "relative",
                                                            width: "100%",
                                                            height: 300,
                                                            border: "2px solid #6b7280",
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            bgcolor: "#18181b",
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                fileObj.previewUrl
                                                            }
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit:
                                                                    "contain",
                                                            }}
                                                        />
                                                    </Box>

                                                    <Stack
                                                        direction="row"
                                                        spacing={2}
                                                        justifyContent="center"
                                                    >
                                                        {hasCamera && (
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={
                                                                    <PhotoCameraIcon />
                                                                }
                                                                onClick={() =>
                                                                    handleCameraForItem(
                                                                        index
                                                                    )
                                                                }
                                                                sx={{
                                                                    borderColor:
                                                                        "#fbbf24",
                                                                    color: "#fbbf24",
                                                                    "&:hover": {
                                                                        borderColor:
                                                                            "#f59e0b",
                                                                        bgcolor:
                                                                            "rgba(251,191,36,0.1)",
                                                                    },
                                                                }}
                                                            >
                                                                {showCamera
                                                                    ? "Close Camera"
                                                                    : "Retake Photo"}
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={
                                                                <UploadIcon />
                                                            }
                                                            onClick={() =>
                                                                handleUploadForItem(
                                                                    index
                                                                )
                                                            }
                                                            sx={{
                                                                borderColor:
                                                                    "white",
                                                                color: "white",
                                                                "&:hover": {
                                                                    borderColor:
                                                                        "#d1d5db",
                                                                    bgcolor:
                                                                        "rgba(255,255,255,0.1)",
                                                                },
                                                            }}
                                                        >
                                                            Replace Image
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            )}

                            {selectedFiles.length === 0 && (
                                <Paper
                                    onClick={() => {
                                        setReplacingIndex(null);
                                        fileInputRef.current.click();
                                    }}
                                    sx={{
                                        position: "relative",
                                        width: "100%",
                                        maxWidth: 480,
                                        height: { xs: 300, sm: 370 },
                                        mx: "auto",
                                        mb: 3,
                                        borderRadius: 2,
                                        bgcolor: "#18181b",
                                        border: "2px dashed #6b7280",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "#fbbf24",
                                            bgcolor: "rgba(251,191,36,0.05)",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            color: "#9ca3af",
                                        }}
                                    >
                                        <UploadIcon
                                            sx={{ fontSize: 48, mb: 2 }}
                                        />
                                        <Typography variant="h6">
                                            Click here to upload your bill
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                                multiple
                                className="hidden"
                            />

                            <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="center"
                                flexWrap="wrap"
                            >
                                {selectedFiles.length > 0 &&
                                    selectedFiles.length < MAX_FILES && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={addNextPage}
                                            sx={{
                                                borderColor: "#fbbf24",
                                                color: "#fbbf24",
                                                "&:hover": {
                                                    borderColor: "#f59e0b",
                                                    bgcolor:
                                                        "rgba(251,191,36,0.1)",
                                                },
                                            }}
                                        >
                                            Add Next Page
                                        </Button>
                                    )}

                                {hasCamera && selectedFiles.length === 0 && (
                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            showCamera ? (
                                                <CloseIcon />
                                            ) : (
                                                <PhotoCameraIcon />
                                            )
                                        }
                                        onClick={toggleCamera}
                                        sx={{
                                            borderColor: "white",
                                            color: "white",
                                            "&:hover": {
                                                borderColor: "#d1d5db",
                                                bgcolor:
                                                    "rgba(255,255,255,0.1)",
                                            },
                                        }}
                                    >
                                        {showCamera
                                            ? "Close Camera"
                                            : "Open Camera"}
                                    </Button>
                                )}

                                <Button
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={handleUpload}
                                    disabled={selectedFiles.length === 0}
                                    sx={{
                                        bgcolor:
                                            selectedFiles.length > 0
                                                ? "#fbbf24"
                                                : "#6b7280",
                                        color:
                                            selectedFiles.length > 0
                                                ? "black"
                                                : "white",
                                        "&:hover": {
                                            bgcolor:
                                                selectedFiles.length > 0
                                                    ? "#f59e0b"
                                                    : "#6b7280",
                                        },
                                        "&:disabled": {
                                            bgcolor: "#6b7280",
                                            color: "white",
                                        },
                                    }}
                                >
                                    Upload{" "}
                                    {selectedFiles.length > 1
                                        ? "Bills"
                                        : "Bill"}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </main>
        </div>
    );
}
