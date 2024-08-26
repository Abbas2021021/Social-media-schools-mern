import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const { palette } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/auth/reset-password/${token}`
        );
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
        } else {
          setMessage("Token is invalid or expired");
        }
      } catch (error) {
        setMessage("error has occured");
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3001/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        navigate("/"); // Redirect to login page after successful password reset
      } else {
        setMessage("Error resetting password.");
      }
    } catch (error) {
      setMessage("Failed to reset the password.");
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
        Reset Your Password
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Reset Password
        </Button>
      </form>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
};

export default ResetPassword;
