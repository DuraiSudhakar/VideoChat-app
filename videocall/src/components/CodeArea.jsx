import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Box } from "@mui/material";
import {CODE_SNIPPETS} from "./constants"
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";

function CodeArea({socket, roomID}) {
    const editorRef = useRef()
    const [value, setValue] = useState("");
    const [Language, setLanguage] = useState("javascript");

    function onMount(editor) {
        editorRef.current = editor;
        editor.focus();
    }

    function handleChange(val) {
        setValue(val);
        socket.emit("newCodeInput", {input: val, roomID});
    }

    function onSelect(language){
        setLanguage(language);
        setValue(CODE_SNIPPETS[language]);
        socket.emit("newLangSelect", { type: language, roomID });
    }
    useEffect(() => {
        socket.on("newCodeInputed", (input) => {
            setValue(input.input);
        });

        socket.on("newLanguage", (lang) => {
            setLanguage(lang.type);
        });
        setValue(CODE_SNIPPETS[Language]);
    }, []);

    return (
        <>
            <Box sx={{ width: "500px", pr: "5px", gridArea: "code" }}>
                <LanguageSelector language={Language} onSelect={onSelect} />
                <Editor
                    width="100%"
                    height="55vh"
                    theme="vs-dark"
                    onMount={onMount}
                    defaultLanguage={CODE_SNIPPETS[Language]}
                    language={Language}
                    value={value}
                    onChange={(val) => handleChange(val)}
                />
            </Box>
            <Output roomID={roomID} editorRef={editorRef} language={Language} socket={socket} />
        </>
    );
}

export default CodeArea;