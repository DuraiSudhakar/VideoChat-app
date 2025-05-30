import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useSignup } from "../hooks/useSignup";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const { signup, error } = useSignup();

    const handleSubmit = async() => {
        await signup(email, password);
    };

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
                Sign Up
            </Button>
        </Box>
    );
};


export default Signup;