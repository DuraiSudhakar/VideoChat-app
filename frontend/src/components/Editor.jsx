import { Box, Typography } from "@mui/material"; 
import { Editor as MonacoEditor } from "@monaco-editor/react"; 

const Editor = ({ title, value, onChange, language, onMount }) => {
    const monacoOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: {
            top: 10,
            bottom: 10,
        },
    };

    const handleEditorDidMount = (editor, monaco) => {
        monaco.editor.defineTheme("dark-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#0a0a0a",
                "editor.lineHighlightBackground": "#1f2937",
                "editorGutter.background": "#1f2937",
                "editorLineNumber.foreground": "#6b7280",
                "editor.selectionBackground": "#2563eb50",
            },
        });
        monaco.editor.setTheme("dark-theme");
    };

    return (
        <Box
            sx={{
                backgroundColor: "#0a0a0a",
                border: "1px solid #374151",
                borderRadius: "8px",
                overflow: "hidden",
                height: "50vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#1f2937",
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid #374151",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Typography variant="caption" sx={{ color: "#9ca3af", ml: 1 }}>
                    {language +" "+ title}
                </Typography>
            </Box>

            <MonacoEditor
                height="100%"
                theme="vs-dark"
                language={language}
                value={value}
                onChange={(val) => onChange(val)}
                options={monacoOptions}
                onMount={onMount}
            />
        </Box>
    );
};

export default Editor;
