import express from "express";
import { login } from "../controllers/auth.js";

const express = require("express");
const { forgotPassword } = require("../controllers/auth.js")
const router = express.Router();

router.post("/login", login);

export default router;
