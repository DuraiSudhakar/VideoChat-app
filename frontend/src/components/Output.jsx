import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Code, Play } from "lucide-react";
import { execute } from "./api";

const Output = ({ editorRef, language, socket, roomID }) => {
    const [output, setOutput] = useState("Code result appers here");
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const runCode = async() => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;
        try {
            setIsLoading(true);
            const { run: result } = await execute(language, sourceCode);
            setOutput(result.output);
            socket.emit("Outputed", { output: result.output, roomID });
            result.stderr ? setIsError(true) : setIsError(false);
        } catch (err) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        socket.on("newOutput", (output) => {
            setOutput(output.output);
        })
    },[])

    return (
        <Box
            sx={{
                backgroundColor: "#1f2937", // bg-gray-800
                border: "1px solid #374151", // border border-gray-700
                borderRadius: "8px", // rounded-lg
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#0a0a0a", // bg-gray-900
                    px: 2, // px-4
                    py: 1.5, // py-3
                    borderBottom: "1px solid #374151", // border-b border-gray-700
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: "medium",
                        color: "#9ca3af", // text-gray-300
                        display: "flex",
                        alignItems: "center",
                        gap: 1, // gap-2
                        fontSize: "0.875rem", // text-sm
                    }}
                >
                    <Code size={20} />
                    Output
                </Typography>
                <Button
                    onClick={runCode}
                    disabled={isLoading}
                    variant="contained"
                    sx={{
                        backgroundColor: "#2563eb", // bg-blue-600
                        "&:hover": {
                            backgroundColor: "#1d4ed8", // hover:bg-blue-700
                        },
                        "&.Mui-disabled": {
                            backgroundColor: "#1e3a8a", // disabled:bg-blue-800
                            color: "white", // Ensure text color remains white
                            cursor: "not-allowed",
                        },
                        color: "white",
                        borderRadius: "6px", // rounded-md
                        fontSize: "0.875rem", // text-sm
                        fontWeight: "medium",
                        textTransform: "none", // Prevent uppercase
                        display: "flex",
                        alignItems: "center",
                        gap: 1, // gap-2
                        px: 2, // px-4
                        py: 1, // py-2
                    }}
                >
                    <Play size={16} />
                    {isLoading ? "Running..." : "Run Code"}
                </Button>
            </Box>
            <Box
                sx={{
                    p: 2, // p-4
                    minHeight: 120,
                    backgroundColor: isError
                        ? "rgba(127, 29, 29, 0.2)"
                        : "#0a0a0a", // bg-red-900 bg-opacity-20 : bg-gray-900
                    borderLeft: isError ? "4px solid #ef4444" : "none", // border-l-4 border-red-500
                }}
            >
                <Typography
                    component="pre"
                    sx={{
                        fontSize: "0.875rem", // text-sm
                        color: "#d1d5db", // text-gray-300
                        fontFamily: "monospace", // font-mono
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {output || "Output will appear here..."}
                </Typography>
            </Box>
        </Box>
    );
}

export default Output;