import { useState } from "react";
import Editor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";

function CodeArea() {
    const [value, setValue] = useState("code here bitch");
    const [Language, setLanguage] = useState("javascript");

    function onSelect(language){
        setLanguage(language);
    }

    return (
        <div style={{margin: "5px"}}>
            <LanguageSelector language={Language} onSelect={onSelect} />
            <Editor width="50%" height="50vh" theme="vs-dark" language={Language} value={value} onChange={(val)=>setValue(val)} />
        </div>
    )
}

export default CodeArea;