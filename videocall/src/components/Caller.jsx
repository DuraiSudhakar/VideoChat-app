import { useEffect, useRef, useState } from "react";
import CodeArea from "./CodeArea.jsx";
import { Box, Button } from "@mui/material";

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
    const peerConnectionRef = useRef(new RTCPeerConnection(ICE_SERVERS)); // Use a ref for peerConnection

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

            // Initial state for audio/video (optional, adjust as needed)
            pauseAudio();
            pauseTrack();
        } catch (error) {
            console.error("Error setting up media:", error);
        }
    };

    const handleOffer = async () => {
        try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit("newOffer", {
                offererName: userN,
                offer,
                roomID,
            });
            console.log("Offer created and sent.");

            peerConnectionRef.current.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    // FIX: Corrected event name "sendIceCandidates"
                    socket.emit("sendIceCandidates", {
                        ice: candidate,
                        type: "sender", // "sender" for the one sending the offer
                        roomID,
                    });
                    console.log("Sending ICE candidate (sender):", candidate);
                }
            };
        } catch (error) {
            console.error("Error creating or sending offer:", error);
        }
    };

    const handleAnswer = () => {
        socket.on("waitingForAnswer", async ({ answer }) => {
            if (!answer) return;
            try {
                await peerConnectionRef.current.setRemoteDescription(answer);
                console.log("Answer received and set as remote description.");
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
                    console.log("Added ICE candidate (receiver):", ice);
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
                console.log("Already made an offer, ignoring incoming offer.");
                return;
            }

            try {
                await peerConnectionRef.current.setRemoteDescription(offer);
                console.log("Offer received and set as remote description.");

                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit("newAnswer", { userId: socket.id, answer, roomID });
                console.log("Answer created and sent.");

                peerConnectionRef.current.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        // FIX: Corrected event name "sendIceCandidates"
                        socket.emit("sendIceCandidates", {
                            ice: candidate,
                            type: "receiver", // "receiver" for the one sending the answer
                            roomID,
                        });
                        console.log(
                            "Sending ICE candidate (receiver):",
                            candidate
                        );
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
                    console.log("Added ICE candidate (sender):", ice);
                } catch (err) {
                    console.error("Error adding ICE candidate (sender):", err);
                }
            }
        });
    };

    const pauseTrack = () => {
        const track = localStream?.getTracks().find((t) => t.kind === "video");
        if (track) {
            track.enabled = !track.enabled;
            console.log("Video track enabled:", track.enabled);
        }
    };

    const pauseAudio = () => {
        const track = localStream?.getTracks().find((t) => t.kind === "audio");
        if (track) {
            track.enabled = !track.enabled;
            console.log("Audio track enabled:", track.enabled);
        }
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
                    width: "100%",
                    gridArea: "call",
                    justifySelf: "center",
                    alignSelf: "center",
                }}
            >
                <p style={{ marginLeft: "15px" }}>
                    <strong>
                        {userN} joined room {roomID}
                    </strong>
                </p>
                <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                    <video
                        className="videoFrame"
                        ref={localRef}
                        autoPlay
                        muted
                    />
                    <video className="videoFrame" ref={remoteRef} autoPlay />
                </Box>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        onClick={() => setDidClickCall(true)}
                    >
                        Call
                    </Button>
                    <Button variant="outlined" onClick={pauseTrack}>
                        Toggle Video
                    </Button>
                    <Button variant="outlined" onClick={pauseAudio}>
                        Toggle Audio
                    </Button>
                </Box>
            </Box>
            <CodeArea socket={socket} roomID={roomID} />
        </>
    );
};

export default Caller;
