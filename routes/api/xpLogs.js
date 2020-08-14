const express = require("express");
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const tables = require("../../xpTables.json");

// Load input validation

// Load Schema
const Schemas = require("../../models/XpLog");
const User = require("../../models/User");
const { response } = require("express");


const XpLog = Schemas.XpLog;
const XpBar = Schemas.XpBar;
// Load User model

// @route POST api/xplogs/createLog
// @desc Creates new Xp Log
// @param {string} startingLevel
// @param {string} logName
// @param {string} userId
// @access Public
router.post("/createLog", (req, res) => {
    // See if user exists
    let userId = req.body.userId;
    User.findOne({ "_id": ObjectId(userId) }).then(user => {
        if(!user){
            return res.status(401).json({
                message: "ERROR: user not found"
            })
        }
        else {
            // Create and save XP log to xpLog database
            let sysId = "DND5E";
            let startingLevelIndex = req.body.startingLevel - 1; 
            let currentXp = tables[sysId].table[startingLevelIndex].xpFloor;
            const xpBar = new XpBar({
                name: "",
                characters: {},
                currentXp: currentXp,
                deeds: []
            })

            const newXpLog = new XpLog({
                name: req.body.logName,
                userId: req.body.userId,
                type: "party",
                systemId: sysId,
                xpBars: [xpBar]
            });

            newXpLog
                .save()
                .then(function(){
                    console.log(user);
                    user.xpLogs.push(newXpLog.id)
                    user
                        .save()
                        .then(savedUser => {
                            console.log(savedUser);
                            savedUser.populate('xpLogs').execPopulate(function(err, data){
                                console.log(data);
                                res.status(200).json(data)
                            });
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err))
        }
    })
});

// @route GET api/xplogs/getLog
// @desc Gets xpLog
// @access Public
router.post("/getLog", (req, res) => {
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