import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const LANGUAGE_OPTIONS = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
];

function LanguageSelector({language, onSelect}) {

    return (
        <FormControl fullWidth sx={{ mb: 2 }}>
            {" "}
            {/* mb-4 */}
            <InputLabel id="language-select-label" sx={{ color: "#9ca3af" }}>
                Programming Language
            </InputLabel>{" "}
            {/* text-gray-300 mb-2 */}
            <Select
                labelId="language-select-label"
                value={language}
                onChange={(e) => onSelect(e.target.value)}
                sx={{
                    width: "100%",
                    px: 0.25, // px-3 (adjust padding to match default Select)
                    py: 0.25, // py-2 (adjust padding)
                    backgroundColor: "#1f2937", // bg-gray-800
                    border: "1px solid #374151", // border border-gray-600
                    borderRadius: "8px", // rounded-lg
                    color: "white",
                    fontSize: "0.875rem", // text-sm
                    ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#374151", // default border
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#374151", // hover border
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#3b82f6", // focus:border-blue-500
                        borderWidth: "2px", // focus:ring-2
                    },
                    "& .MuiSelect-icon": {
                        color: "white", // dropdown icon color
                    },
                    "&.Mui-disabled": {
                        opacity: 0.5, // disabled:opacity-50
                        cursor: "not-allowed", // disabled:cursor-not-allowed
                    },
                }}
            >
                {LANGUAGE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default LanguageSelector;
