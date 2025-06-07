import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
    Users,
    Minimize2,
    Maximize2,
    VideoOff,
    Video,
    Mic,
    MicOff,
    Phone,
    PhoneCall,
    Settings,
} from "lucide-react";

const ICE_SERVERS = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
            ],
        },
    ],
};

const Caller = ({ socket, userN, roomID }) => {
    const localRef = useRef(null);
    const remoteRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null); // Initialize as null or empty MediaStream
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const peerConnectionRef = useRef(new RTCPeerConnection(ICE_SERVERS)); // Use a ref for peerConnection
    const [isVideoMaximized, setIsVideoMaximized] = useState(false);

    const setupMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true,
            });

            setLocalStream(stream);
            localRef.current.srcObject = stream;
            await localRef.current.play();

            stream.getTracks().forEach((track) => {
                peerConnectionRef.current.addTrack(track, stream);
            });

            // FIX: Directly assign the remote stream when tracks are received
            peerConnectionRef.current.ontrack = (event) => {
                if (remoteRef.current) {
                    remoteRef.current.srcObject = event.streams[0];
                    setRemoteStream(event.streams[0]); // Update state for potential re-renders if needed
                }
            };
        } catch (error) {
            setError("Failed to access camera/microphone: " + error.message);
            console.error("Error setting up media:", error);
        }
    };

    const toggleVideo = () => {
        if (!localStream) return;

        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoEnabled(videoTrack.enabled);
        }
    };

    const toggleAudio = () => {
        if (!localStream) return;

        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioEnabled(audioTrack.enabled);
        }
    };

    const handleOffer = async () => {

        setIsConnecting(true);
        setError(null);
        try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit("newOffer", {
                offererName: userN,
                offer,
                roomID,
            });

            peerConnectionRef.current.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    // FIX: Corrected event name "sendIceCandidates"
                    socket.emit("sendIceCandidates", {
                        ice: candidate,
                        type: "sender", // "sender" for the one sending the offer
                        roomID,
                    });
                }
            };
            setIsConnected(true);
        } catch (error) {
            setError("Failed to start call: " + error.message);
            console.error("Error creating or sending offer:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleAnswer = () => {
        socket.on("waitingForAnswer", async ({ answer }) => {
            if (!answer) return;
            try {
                await peerConnectionRef.current.setRemoteDescription(answer);
            } catch (error) {
                console.error(
                    "Error setting remote description from answer:",
                    error
                );
            }
        });

        // FIX: Corrected event name "receiveIceCandidates"
        socket.on("receiveIceCandidates", async ({ ice, type }) => {
            if (type === "receiver") {
                // "receiver" for the one who sent the answer
                try {
                    await peerConnectionRef.current.addIceCandidate(ice);
                } catch (err) {
                    console.error(
                        "Error adding ICE candidate (receiver):",
                        err
                    );
                }
            }
        });
    };

    const listenForOffer = () => {
        socket.on("waitingForOffer", async ({ offer }) => {
            // If we have already created an offer, we shouldn't respond to another offer.
            // This simplifies the logic and assumes a two-peer connection setup.
            // For multi-peer, you'd need more sophisticated session management.
            if (
                peerConnectionRef.current.localDescription &&
                peerConnectionRef.current.localDescription.type === "offer"
            ) {
                return;
            }

            try {
                await peerConnectionRef.current.setRemoteDescription(offer);

                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit("newAnswer", { userId: socket.id, answer, roomID });

                peerConnectionRef.current.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        // FIX: Corrected event name "sendIceCandidates"
                        socket.emit("sendIceCandidates", {
                            ice: candidate,
                            type: "receiver", // "receiver" for the one sending the answer
                            roomID,
                        });
                    }
                };
            } catch (error) {
                console.error("Error handling incoming offer:", error);
            }
        });

        // FIX: Corrected event name "receiveIceCandidates"
        socket.on("receiveIceCandidates", async ({ ice, type }) => {
            if (type === "sender") {
                // "sender" for the one who sent the offer
                try {
                    await peerConnectionRef.current.addIceCandidate(ice);
                } catch (err) {
                    console.error("Error adding ICE candidate (sender):", err);
                }
            }
        });
    };

    // Initialization: Setup media once
    useEffect(() => {
        setupMedia();
    }, []);

    // Listen for offers and answers once when component mounts
    useEffect(() => {
        listenForOffer();
        handleAnswer(); // This will setup the listener for answers
    }, []);

    // Effect for handling the "Call" button click
    const [didClickCall, setDidClickCall] = useState(false);
    useEffect(() => {
        if (didClickCall && localStream) {
            // Ensure local stream is ready before offering
            handleOffer();
            setDidClickCall(false); // Reset to prevent re-triggering
        }
    }, [didClickCall, localStream]);

    return (
        <>
            <Box
                sx={{
                    backgroundColor: "#1f2937", // bg-gray-800
                    border: "1px solid #374151", // border border-gray-700
                    borderRadius: "8px", // rounded-lg
                    overflow: "hidden",
                    transition: "all 300ms ease-in-out",
                    display: "flex",
                    flexDirection: "column",
                    ...(isVideoMaximized
                        ? {
                              position: "fixed",
                              top: "1rem", // top-4
                              left: "1rem", // left-4
                              right: "1rem", // right-4
                              bottom: "1rem", // bottom-4
                              zIndex: 50, // z-50
                              height: "auto",
                          }
                        : {
                              height: 256, // h-64
                          }),
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#0a0a0a", // bg-gray-900
                        px: 2, // px-4
                        py: 1, // py-2
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #374151", // border-b border-gray-700
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            fontSize: "0.875rem",
                            color: "#9ca3af",
                        }}
                    >
                        {" "}
                        {/* text-sm text-gray-300 */}
                        <Users size={16} />
                        <span>Video Call</span>
                        {isConnected && (
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    backgroundColor: "#22c55e",
                                    borderRadius: "50%",
                                    animation:
                                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                                }}
                            ></Box>
                        )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {" "}
                        {/* flex gap-2 */}
                        <Button
                            onClick={() =>
                                setIsVideoMaximized(!isVideoMaximized)
                            }
                            sx={{
                                p: 0.5, // p-1
                                color: "#9ca3af", // text-gray-400
                                "&:hover": {
                                    color: "white",
                                    backgroundColor: "#374151", // hover:bg-gray-700
                                },
                                borderRadius: "4px", // rounded
                                transition: "all 150ms ease-in-out", // transition-colors
                                minWidth: "unset", // remove default button min-width
                            }}
                        >
                            {isVideoMaximized ? (
                                <Minimize2 size={16} />
                            ) : (
                                <Maximize2 size={16} />
                            )}
                        </Button>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: "relative",
                        flex: 1,
                        backgroundColor: "black",
                    }}
                >
                    {" "}
                    {/* relative flex-1 bg-black */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "1px",
                            height: "100%",
                        }}
                    >
                        {" "}
                        {/* grid grid-cols-2 gap-px h-full */}
                        <Box
                            sx={{
                                position: "relative",
                                backgroundColor: "#1f2937",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {" "}
                            {/* relative bg-gray-800 flex items-center justify-center */}
                            <video
                                ref={localRef}
                                autoPlay
                                muted
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }} // w-full h-full object-cover
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: 8,
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    color: "white",
                                }}
                            >
                                {" "}
                                {/* absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white */}
                                You
                            </Box>
                            {!isVideoEnabled && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        backgroundColor: "#1f2937",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        color: "#6b7280",
                                        gap: 1,
                                    }}
                                >
                                    {" "}
                                    {/* absolute inset-0 bg-gray-800 flex items-center justify-center flex-col text-gray-500 gap-2 */}
                                    <VideoOff size={32} />
                                </Box>
                            )}
                        </Box>
                        <Box
                            sx={{
                                position: "relative",
                                backgroundColor: "#1f2937",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {" "}
                            {/* relative bg-gray-800 flex items-center justify-center */}
                            <video
                                ref={remoteRef}
                                autoPlay
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }} // w-full h-full object-cover
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: 8,
                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    color: "white",
                                }}
                            >
                                {" "}
                                {/* absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white */}
                                {isConnected ? "Peer" : "Waiting..."}
                            </Box>
                            {!remoteStream && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        backgroundColor: "#1f2937",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        color: "#6b7280",
                                        gap: 1,
                                    }}
                                >
                                    {" "}
                                    {/* absolute inset-0 bg-gray-800 flex items-center justify-center flex-col text-gray-500 gap-2 */}
                                    <Users size={32} />
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "0.875rem" }}
                                    >
                                        Waiting for peer...
                                    </Typography>{" "}
                                    {/* text-sm */}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {error && (
                    <Box
                        sx={{
                            backgroundColor: "#7f1d1d", // bg-red-900
                            borderLeft: "4px solid #ef4444", // border-l-4 border-red-500
                            p: 2, // p-4
                            color: "#fca5a5", // text-red-200
                            fontSize: "0.875rem", // text-sm
                        }}
                    >
                        {error}
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    bottom: 200, // bottom-4
                    left: "25%",
                    transform: "translateX(-50%)", // -translate-x-1/2
                    display: "flex",
                    gap: 1, // gap-2
                    backgroundColor: "rgba(0, 0, 0, 0.7)", // bg-black bg-opacity-70
                    px: 2, // px-4
                    py: 1, // py-2
                    borderRadius: "9999px", // rounded-full
                }}
            >
                <Button
                    onClick={toggleVideo}
                    sx={{
                        p: 1.5, // p-3
                        borderRadius: "50%", // rounded-full
                        color: "white",
                        transition: "all 150ms ease-in-out",
                        minWidth: "unset", // remove default button min-width
                        backgroundColor: isVideoEnabled ? "#374151" : "#dc2626", // bg-gray-700 : bg-red-600
                        "&:hover": {
                            backgroundColor: isVideoEnabled
                                ? "#4b5563"
                                : "#b91c1c", // hover:bg-gray-600 : hover:bg-red-700
                        },
                    }}
                >
                    {isVideoEnabled ? (
                        <Video size={20} />
                    ) : (
                        <VideoOff size={20} />
                    )}
                </Button>

                <Button
                    onClick={toggleAudio}
                    sx={{
                        p: 1.5, // p-3
                        borderRadius: "50%", // rounded-full
                        color: "white",
                        transition: "all 150ms ease-in-out",
                        minWidth: "unset",
                        backgroundColor: isAudioEnabled ? "#374151" : "#dc2626", // bg-gray-700 : bg-red-600
                        "&:hover": {
                            backgroundColor: isAudioEnabled
                                ? "#4b5563"
                                : "#b91c1c", // hover:bg-gray-600 : hover:bg-red-700
                        },
                    }}
                >
                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>

                {!isConnected ? (
                    <Button
                        onClick={() => setDidClickCall(true)}
                        disabled={isConnecting}
                        sx={{
                            p: 1.5, // p-3
                            borderRadius: "50%", // rounded-full
                            backgroundColor: "#16a34a", // bg-green-600
                            "&:hover": {
                                backgroundColor: "#15803d", // hover:bg-green-700
                            },
                            "&.Mui-disabled": {
                                backgroundColor: "#1f442b", // disabled:bg-green-800
                                cursor: "not-allowed",
                                color: "white", // Ensure text color remains white
                            },
                            color: "white",
                            transition: "all 150ms ease-in-out",
                            minWidth: "unset",
                        }}
                    >
                        {isConnecting ? (
                            <Settings size={20} className="animate-spin" />
                        ) : (
                            <Phone size={20} />
                        )}
                    </Button>
                ) : (
                    <></>
                )}
            </Box>
        </>
    );
};

export default Caller;
