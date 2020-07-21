const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const ObjectId = require('mongodb').ObjectID;

// Load input validation

// Load Schema
const Schemas = require("../../models/XpLog");
const e = require("express");

const XpLog = Schemas.XpLog;
const XpBar = Schemas.XpBar;

// @route POST api/xplogs/createLog
// @desc Creates new Xp Log
// @access Public
router.post("/createLog", (req, res) => {
    // Form validation
    console.log(req.body);
    const xpBar = new XpBar({
        name: "",
        characters: {},
        currentXp: 0,
        deeds: []
    })

    const newXpLog = new XpLog({
        name: req.body.name,
        userId: req.body.userId,
        type: "party",
        systemId: "DND5E",
        xpBars: [xpBar]
    });

    newXpLog
        .save()
        .then(log => res.status(200).json(log))
        .catch(err => console.log(err))
});

// @route GET api/xplogs/getLog
// @desc Gets xpLog
// @access Public
router.get("/getLog", (req, res) => {
    XpLog.find({ "_id": ObjectId(req.body.id) }).then(xpLog => {
        if(!xpLog) {
            return res.status(404).json({
                message: "404: xp log not found"
            })
        }
        else {
            const payload = xpLog; //Return everything for now.  No formatting need
            res.json({
                xpLog: payload
            })
        }
    })
});

// @route POST api/users/deleteLog
// @desc Deletes Xp Log
// @access Public
router.post("/deleteLog", (req, res) => {
    XpLog.deleteOne({"_id": ObjectId(req.body.id) }).then(xpLog => {
        if(!xpLog) {
            return res.status(404).json({
                message: "404: xp log not found"
            })
        }
        else {
            res.json({
                message: "Log " + req.body.id + " removed successfully"
            })
        }
    });
});

module.exports = router;