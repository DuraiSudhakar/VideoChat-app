import { useEffect } from "react";
import { useState, useRef } from "react";
import { LANGUAGE_VERSIONS } from "./constants";
function LanguageSelector({language, onSelect}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const languages = Object.entries(LANGUAGE_VERSIONS);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    },[])

    return (
        <div className="dropDownArea" ref={menuRef}>
            <button
                className="dropDownButton"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {language}
            </button>
            {isOpen && (
                <ul className="dropDownList">
                    {languages.map(([language, version]) => (
                        <li key={language} className="dropDownListItems">
                            <button onClick={()=>onSelect(language)}>
                                {language}{" "}
                                <span
                                    className="versions"
                                    style={{ display: "inline-block" }}
                                >
                                    {version}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default LanguageSelector;
