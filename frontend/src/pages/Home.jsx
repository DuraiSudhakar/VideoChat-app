import { useState, useEffect } from "react"; 
import StatusBar from "../components/StatusBar";
import Caller from "../components/Caller";
import CodeArea from "../components/CodeArea";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, TextField } from "@mui/material";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const Home = ({ socket }) => {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState(
        `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`
    );
    const [title, setTitle] = useState("Sample_code");
    const [roomID, setRoomID] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [roomStatusMessage, setRoomStatusMessage] = useState("");
    const [executionHistory, setExecutionHistory] = useState([]);
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

    // Add to Output.jsx

    const saveExecution = (code, output, isError) => {
        setExecutionHistory((prev) => [...prev, { code, output, isError, title: title }]);
        console.log(executionHistory);
    };

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
                                sx={{
                                    input: { color: "white" },
                                    label: { color: "white" },
                                    "& .MuiOutlinedInput-root": {
                                        "&:hover fieldset": {
                                            borderColor: "lightgray",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "white",
                                        },
                                    },
                                }}
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
                    <StatusBar
                        language={language}
                        code={code}
                        roomID={roomID}
                    />
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
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
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
                                    backgroundColor: "#0a0a0a",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                    width: "95%",
                                    margin: "10px",
                                    height: "47%",
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "auto",
                                }}
                            >
                                <TextField
                                    label="Title for the Code"
                                    margin="normal"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    sx={{
                                        margin: "5px",
                                        input: { color: "white" },
                                        label: { color: "white" },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                borderColor: "#6b7280",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "lightgray",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "white",
                                            },
                                        },
                                    }}
                                />
                                <Typography
                                    component="pre"
                                        sx={{
                                        margin:"5px",
                                        fontSize: "0.875rem",
                                        color: "#d1d5db",
                                        fontFamily: "monospace",
                                        whiteSpace: "pre-wrap",
                                        flexShrink: 1, // Allows text to wrap
                                    }}
                                >
                                    Code History:
                                </Typography>
                                {executionHistory.map((execution, index) => (
                                    <Accordion
                                        key={index}
                                        sx={{
                                            marginX: "15px",
                                            marginY: "5px",
                                            width: "450px",
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: "none",
                                                },
                                            },
                                            backgroundColor: execution.isError
                                                ? "rgba(127, 29, 29, 0.2)"
                                                : "#374151",
                                            borderLeft: execution.isError
                                                ? "4px solid #ef4444"
                                                : "none",
                                        }}
                                    >
                                        <AccordionSummary
                                            sx={{ color: "#9ca3af" }}
                                            expandIcon={
                                                <ExpandMoreIcon
                                                    sx={{ color: "#d1d5db" }}
                                                />
                                            } // Adjust icon color
                                            aria-controls={`panel${index}-content`}
                                            id={`panel${index}-header`}
                                        >
                                            {execution.title}
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography
                                                component="pre"
                                                sx={{
                                                    fontSize: "0.875rem",
                                                    color: "#d1d5db",
                                                    fontFamily: "monospace",
                                                    whiteSpace: "pre-wrap",
                                                    flexShrink: 1, // Allows text to wrap
                                                }}
                                            >
                                                Code:
                                            </Typography>
                                            <Typography
                                                component="pre"
                                                sx={{
                                                    fontSize: "0.875rem",
                                                    color: "#d1d5db",
                                                    fontFamily: "monospace",
                                                    whiteSpace: "pre-wrap",
                                                    flexShrink: 1, // Allows text to wrap
                                                }}
                                            >
                                                {execution.code}
                                            </Typography>
                                            <Typography
                                                component="pre"
                                                sx={{
                                                    fontSize: "0.875rem",
                                                    color: "#d1d5db",
                                                    fontFamily: "monospace",
                                                    whiteSpace: "pre-wrap",
                                                    flexShrink: 1, // Allows text to wrap
                                                }}
                                            >
                                                {"\nOutput:"}
                                            </Typography>
                                            <Typography
                                                component="pre"
                                                sx={{
                                                    fontSize: "0.875rem",
                                                    color: "#d1d5db",
                                                    fontFamily: "monospace",
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {execution.output}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
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
                                title={title}
                                saveExecution={saveExecution}
                                socket={socket}
                                roomID={roomID}
                                setLang={setLanguage}
                                setCode={setCode}
                            />
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Home;
