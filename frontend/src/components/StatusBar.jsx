import { Box, Typography } from "@mui/material";
import CopyLinkButton from "./CopyLinkButton";

const StatusBar = ({ language, code, roomID }) => {
    return (
        <Box
            sx={{
                backgroundColor: "#0a0a0a", // bg-gray-900
                borderBottom: "1px solid #374151", // border-t border-gray-700
                px: 3, // px-6
                py: 1, // py-2
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.875rem", // text-sm
            }}
        >
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                {" "}
                {/* text-gray-400 */}
                Language:{" "}
                <Typography component="span" sx={{ color: "white" }}>
                    {language}
                </Typography>
            </Typography>
            <CopyLinkButton
                linkToCopy={roomID}
                buttonText={`Copy RoomId: ${roomID}`}
            />
            <Box sx={{ display: "flex", gap: 2, color: "#9ca3af" }}>
                {" "}
                {/* flex gap-4 text-gray-400 */}
                <Typography variant="body2">
                    Lines:{" "}
                    <Typography component="span" sx={{ color: "white" }}>
                        {code.split("\n").length}
                    </Typography>
                </Typography>
                <Typography variant="body2">
                    Characters:{" "}
                    <Typography component="span" sx={{ color: "white" }}>
                        {code.length}
                    </Typography>
                </Typography>
            </Box>
        </Box>
    );
};
export default StatusBar;
