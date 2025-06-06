import { useState, useEffect } from "react"; 
import StatusBar from "../components/StatusBar";
import Caller from "../components/Caller";
import CodeArea from "../components/CodeArea";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const Home = ({ socket }) => {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState(
        `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`
    );
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
                <Box
                    sx={{
                        minHeight: "100vh",
                        backgroundColor: "#0a0a0a", // bg-gray-900
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        component="main"
                        sx={{
                            display: "flex",
                            flex: 1, // flex-1
                            height: "calc(100vh - 80px)",
                            "@media (max-width: 900px)": {
                                // Responsive adjustment for smaller screens
                                flexDirection: "column",
                                height: "auto", // Adjust height for column layout
                            },
                        }}
                    >
                        <Box sx={{ flex: 1, p: 3 }}>
                            {" "}
                            {/* flex-1 p-6 */}
                            <Caller
                                socket={socket}
                                userName={user.email}
                                roomID={roomID}
                            />
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                p: 3,
                                borderLeft: "1px solid #374151",
                                "@media (max-width: 900px)": {
                                    // Responsive adjustment
                                    borderLeft: "none",
                                    borderTop: "1px solid #374151",
                                },
                            }}
                        >
                            {" "}
                            {/* flex-1 p-6 border-l border-gray-700 */}
                            <CodeArea
                                socket={socket}
                                roomID={roomID}
                                setLang={setLanguage}
                                setCode={setCode}    
                            />
                        </Box>
                    </Box>

                    <StatusBar language={language} code={code} roomID={roomID} />
                </Box>
            )}
        </>
    );
};

export default Home;
