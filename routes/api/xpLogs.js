const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load input validation

// Load Schema
const XpLog = require("../../models/XpLog");

router.post("/getLogs")