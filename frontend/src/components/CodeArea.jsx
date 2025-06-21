import { useState, useRef, useEffect } from "react";
import Editor from "../components/Editor";
import Output from "../components/Output";
import LanguageSelector from "../components/LanguageSelector";
import { Box } from "@mui/material";
import { CODE_SNIPPETS } from "./constants";

function CodeArea({ title, saveExecution, socket, roomID, setLang, setCode }) {
    const editorRef = useRef();
    const [value, setValue] = useState(
        `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`
    );
    const [Language, setLanguage] = useState("javascript");

    function onMount(editor) {
        editorRef.current = editor;
        editor.focus();
    }

    function handleChange(val) {
        setValue(val);
        setCode(val);
        socket.emit("newCodeInput", { input: val, roomID });
    }

    function onSelect(language) {
        setLanguage(language);
        setLang(language);
        setValue(CODE_SNIPPETS[language]);
        setCode(CODE_SNIPPETS[language]);
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
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <LanguageSelector language={Language} onSelect={onSelect} />

            <Box sx={{ flex: 1, mb: 2 }}>
                {" "}
                {/* flex-1 mb-4 */}
                <Editor
                    title={title}
                    value={value}
                    onChange={handleChange}
                    language={Language}
                    onMount={onMount}
                />
            </Box>

            <Output
                saveExecution={saveExecution}
                editorRef={editorRef}
                language={Language}
                socket={socket}
                roomID={roomID}
            />
        </Box>
    );
}

export default CodeArea;