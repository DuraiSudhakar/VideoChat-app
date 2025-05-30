import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { execute } from "./api";
import { Box } from "@mui/material";

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
        <Box sx={{width:"500px", gridArea: "output"}}>
            <h3 style={{ padding: "10px", display: "inline"}}>Output</h3>
            <button isLoading={isLoading} onClick={runCode}>
                Run
            </button>
            <br />
            <Editor
                width="100%"
                height="10vh"
                theme="vs-dark"
                language="text"
                value={output}
            />
        </Box>
    );
}

export default Output;