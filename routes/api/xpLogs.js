const express = require("express");
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const tables = require("../../xpTables.json");
const xpTools = require("../../services/xpTools");
// Load input validation

// Load Schema
const Schemas = require("../../models/XpLog");
const User = require("../../models/User");
const { response } = require("express");

const XpLog = Schemas.XpLog;
const XpBar = Schemas.XpBar;
const Deed = Schemas.Deed;
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

            const startingDeed = new Deed({
                description: "Starting XP",
                xpRewarded: currentXp,
            })
            const xpBar = new XpBar({
                name: "",
                characters: {},
                currentXp: currentXp,
                deeds: [startingDeed]
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
                    user.xpLogs.push(newXpLog.id)
                    user
                        .save()
                        .then(savedUser => {
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
    XpLog.find({ "_id": ObjectId(req.body.id) }).lean().then(xpLog => {
        if(!xpLog) {
            return res.status(404).json({
                message: "404: xp log not found"
            })
        }
        else {
            let log = xpLog[0];
            let sysId = log.systemId;
            //let currentXp = xpLog
            console.log(log);
            log.xpBars[0].currentLevel = xpTools.getCurrentLevel(tables[sysId].table, log.xpBars[0].currentXp);
            const data = {
                xpLog: log,
                table: tables[sysId]
            }
            res.status(200).json(data);
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
                message: "Log " + req.body.id + " removed successfully",
                data: xpLog
            })
        }
    });
});

/*
* Name: addDeed
* Description: Given a log ID, this endpoint adds a deed to the user's log
*              and updates the currentXP total.
* 
*/
router.post("/addDeed", (req, res) => {
    // Find current XP log
    XpLog.findOne({ "_id": ObjectId(req.body.id) }).then(xpLog => {
        if(!xpLog) {
            return res.status(404).json({
                message: "404: xp log not found"
            })
        }
        else {

            var xpRewarded = Number(req.body.xp);

            let newDeed = new Deed({
                description: req.body.description,
                xpRewarded: xpRewarded
            });

            // Add new deed then sort
            xpLog.xpBars[0].deeds.push(newDeed);
            xpLog.xpBars[0].deeds.sort(function(a, b){
                return new Date(b.date) - new Date(a.date);
            });

            // Update currentXp
            xpLog.xpBars[0].currentXp += xpRewarded;
            xpLog
                .save()
                .then(savedLog => {
                    res.status(200).json(savedLog)
                })
                .catch(err => console.log(err));
        }
    })
})

module.exports = router;