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
        <Box sx={{ p: 3 }}>
            <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button fullWidth variant="contained" onClick={handleSubmit}>
                Login
            </Button>
        </Box>
    );
}

export default Login;