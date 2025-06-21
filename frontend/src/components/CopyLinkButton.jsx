import React, { useState } from "react";
import { Button, Snackbar, Alert, Box } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // Material-UI icon for copy

function CopyLinkButton({ linkToCopy, buttonText = "Copy Link" }) {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' or 'error'

    const handleCopyClick = async () => {
        try {
            await navigator.clipboard.writeText(linkToCopy);
            setSnackbarMessage("Link copied to clipboard!");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
        } catch (err) {
            console.error("Failed to copy: ", err);
            setSnackbarMessage("Failed to copy link.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Box>
            <Button
                variant="contained"
                onClick={handleCopyClick}
                startIcon={<ContentCopyIcon />}
                sx={{
                    backgroundColor: "#3f51b5", // Example blue color
                    "&:hover": {
                        backgroundColor: "#303f9f",
                    },
                    color: "white",
                    textTransform: "none", // Prevent uppercase
                    padding: "8px 16px",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                }}
            >
                {buttonText}
            </Button>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default CopyLinkButton;
