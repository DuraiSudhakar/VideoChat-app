import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useLogin } from "../hooks/useLogin";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, error } = useLogin();

    const handleSubmit = async() => {
        await login(email, password);
    }

    return (
        <Box
            sx={{
                height: "90vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box sx={{ p: 3 }}>
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                        input: { color: "white" },
                        label: { color: "white" },
                        "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "lightgray" },
                            "&.Mui-focused fieldset": { borderColor: "white" },
                        },
                    }}
                />
                <TextField
                    label="Password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                        input: { color: "white" },
                        label: { color: "white" },
                        "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": { borderColor: "lightgray" },
                            "&.Mui-focused fieldset": { borderColor: "white" },
                        },
                    }}
                />
                <Button fullWidth variant="contained" onClick={handleSubmit}>
                    Login
                </Button>
            </Box>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </Box>
    );
}

export default Login;