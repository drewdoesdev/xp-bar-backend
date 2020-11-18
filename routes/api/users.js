const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = process.env.KEY;
var ObjectId = require('mongodb').ObjectID;

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");
const Schemas = require("../../models/XpLog");
const XpLog = Schemas.XpLog;
const XpBar = Schemas.XpBar;

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check validation
    if (!isValid) {
        const response = {
            Errors: [errors]
        }
        return res.status(200).json(response);
    }

    const query = {
        $or:[{
            email: req.body.email
        }, 
        {
            username: req.body.username
        }]
    }
    User.findOne(query).then(user => {
        if (user) {
            const response = {
                Errors: ["Sorry, that username or email was already found in our system."]
            }
            return res.status(200).json(response);
        } else {
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            // Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.status(200).json(user))
                        .catch(err => {
                             
                        });
                });
            });
        }
    });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
        const response = {
            Errors: [errors]
        }
        return res.status(200).json(response);
    }
    const username = req.body.username
    const password = req.body.password;
    // Find user by email
    User.findOne({ username }).then(user => {
        // Check if user exists
        if (!user) {
            const response = {
                Errors: ["Sorry, that username/ password combination is incorrect.  Please check your credentials and try again."]
            }
            return res.status(200).json(response);
        }
        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.username
                };
                // Sign token
                jwt.sign(
                    payload,
                    key,
                    {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err, token) => {
                        user.save(err => console.log(err));
                        res.json({
                            success: true,
                            token: token
                        });
                    }
                );
            } else {
                const response = {
                    Errors: ["Sorry, that username/ password combination is incorrect.  Please check your credentials and try again."]
                }
                return res.status(200).json(response);
            }
        });
    });
});

// @route GET api/users/getAccountInfo
// @desk Gets account info
// @access Public
router.post("/getAccountInfo", (req, res) => {
    const userId = req.body.userId;
    User.findOne({ "_id": ObjectId(userId) }).populate('xpLogs').exec(function(err, user){
        res.status(200).send(user);
    })
})

module.exports = router;