import { useState, useEffect } from "react"; 
import Caller from "../components/Caller";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAuthContext } from "../hooks/useAuthContext";

const Home = ({ socket }) => {
    const [roomID, setRoomID] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [roomStatusMessage, setRoomStatusMessage] = useState(""); 
    const { user } = useAuthContext();
    useEffect(() => {
        if (socket) {
            socket.on("room-full", (data) => {
                console.error("Room is full:", data.error);
                setRoomStatusMessage(data.error); 
                setRedirect(false); 
            });
            socket.on("users-in-room", ({ count }) => {
                console.log(`Current users in room: ${count}`);
            });
            return () => {
                socket.off("room-full");
                socket.off("users-in-room");
            };
        }
    }, [socket]); 

    const joinRoom = () => {
        setRoomStatusMessage("");

        if (!user || !roomID) {
            return alert("Please enter your username and a Room ID.");
        }
        socket.emit("join-room", { user: user.email, roomID }); 
        setRedirect(true);
    };

    const createRoom = () => {
        setRoomStatusMessage("");

        if (!user) {
            return alert("Please enter your username.");
        }
        const newRoomID = crypto.randomUUID().split("-")[0];
        setRoomID(newRoomID); 
        socket.emit("join-room", { user: user.email, roomID: newRoomID }); 
        setRedirect(true);
    };

    return (
        <>

            {!redirect ? (
                <>
                    <Box
                        sx={{
                            height: "90vh",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{ p: 3, width: "340px" }}>
                            <TextField
                                label="Room ID"
                                fullWidth
                                margin="normal"
                                value={roomID}
                                onChange={(e) => setRoomID(e.target.value)}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={joinRoom}
                            >
                                Join Room
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={createRoom}
                                sx={{ mt: 1 }}
                            >
                                Create New Room
                            </Button>

                            {/* Display room status message if any */}
                            {roomStatusMessage && (
                                <Typography
                                    color="error"
                                    sx={{ mt: 2, textAlign: "center" }}
                                >
                                    {roomStatusMessage}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </>
            ) : (
                <>
                    <Box className="gridContainer">
                        <Caller
                            socket={socket}
                            userN={user.email}
                            roomID={roomID}
                        />{" "}
                        {/* Pass user.email */}
                    </Box>
                </>
            )}
        </>
    );
};

export default Home;
