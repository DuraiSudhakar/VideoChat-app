import { LANGUAGE_VERSIONS } from "./constants";

export const execute = async (language, sourceCode) => {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            language: language,
            version: LANGUAGE_VERSIONS[language],
            files: [
                {
                    content: sourceCode,
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = response.json();
    return data;
}