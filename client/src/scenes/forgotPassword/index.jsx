import React, { useState } from 'react';
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { palette } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/auth/forgotPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);
            } else {
                setMessage('Error sending password reset email.');
            }
        } catch (error) {
            setMessage('Failed to send the request.');
        }
    };

    return (
        <Box
            width="50%"
            p="2rem"
            m="2rem auto"
            borderRadius="1.5rem"
            backgroundColor={palette.background.alt}
        >
            <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
                Forgot Your Password?
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: "1.5rem" }}
                    required
                />
                <Button
                    type="submit"
                    fullWidth
                    sx={{
                        backgroundColor: palette.primary.main,
                        color: palette.background.alt,
                        "&:hover": { color: palette.primary.main },
                    }}
                >
                    Send Reset Link
                </Button>
            </form>
            {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
        </Box>
    );
};

export default ForgotPassword;
