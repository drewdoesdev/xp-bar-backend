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
            const response = {
                Errors: ["User associated with this log could not be found.  Please try again."]
            }
            return res.status(200).json(response);
        }
        else {
            // Create and save XP log to xpLog database
            let sysId = "DND5E";
            let startingLevelIndex = req.body.startingLevel - 1; 
            let currentXp = Number(tables[sysId].table[startingLevelIndex].xpFloor);
            let currentLevelData = xpTools.getCurrentLevel(tables[sysId].table, currentXp);
            currentLevel = Number(currentLevelData.level);

            const startingDeed = new Deed({
                description: "Starting XP",
                xpRewarded: currentXp,
            })
            const xpBar = new XpBar({
                name: "",
                characters: {},
                currentXp: currentXp,
                currentLevel: currentLevel,
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
                        .catch(err => {
                            const response = {
                                Errors: [err]
                            }
                            res.status(200).json(response)
                        });
                })
                .catch(err => {
                    const response = {
                        Errors: [err]
                    }
                    res.status(200).json(response)
                })
        }
    })
});

// @route GET api/xplogs/getLog
// @desc Gets xpLog
// @access Public
router.post("/getLog", (req, res) => {
    XpLog.find({ "_id": ObjectId(req.body.id) }).lean().then(xpLog => {
        if(!xpLog) {
            const response = {
                Errors: ["Sorry, that log could not be found in our system.  Please try again."]
            }
            return res.status(200).json(response);
        }
        else {
            let log = xpLog[0];
            let sysId = log.systemId;

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
            const response = {
                Errors: ["There was an error removing your XP Log.  Please try again later."]
            }
            res.status(200).json(response);
        }
        else {
            const response = {
                Success: ["Log was removed successfully!."]
            }
            return res.status(200).json(response);
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
            const response = {
                Errors: ["There was an error removing your XP Log.  Please try again later."]
            }
            res.status(200).json(response)
        }
        else {

            var xpRewarded = Number(req.body.xp);

            let newDeed = new Deed({
                description: req.body.description,
                xpRewarded: xpRewarded
            });
            let sysId = xpLog.systemId;

            // Add new deed then sort
            xpLog.xpBars[0].deeds.push(newDeed);
            xpLog.xpBars[0].deeds.sort(function(a, b){
                return new Date(b.date) - new Date(a.date);
            });

            // Update currentXp
            xpLog.xpBars[0].currentXp += xpRewarded;

            // Update current level
            let currentLevelData = xpTools.getCurrentLevel(tables[sysId].table, xpLog.xpBars[0].currentXp);
            console.log(currentLevelData);
            xpLog.xpBars[0].currentLevel = Number(currentLevelData.level);
            xpLog
                .save()
                .then(() => {
                    res.status(200).json(xpLog);
                })
                .catch(err => {
                    console.log(err);
                    const response = {
                        Errors: ["The server rolled a natural 1.  Please try again later."]
                    }
                    res.status(200).json(response)
                });
        }
    })
})

router.post("/removeDeed", (req, res) => {
    // Find current XP log
    var query = { 
        "_id": ObjectId(req.body.logId)
    }
    var update = {
        "$pull": {
            "xpBars.0.deeds": {
                "_id": ObjectId(req.body.deedId)
            }
        }
    } 

    XpLog.findOneAndUpdate(query, update, {new: true}, function(err, xpLog){
        if(err){
            res.status(500).json(err);
        }
        else {
            // Get current XP
            let currentXp = 0;
            xpLog.xpBars[0].deeds.forEach(deed =>{
                currentXp += deed.xpRewarded;
            })
            xpLog.xpBars[0].currentXp = currentXp;

            // Get Current Level
            let sysId = xpLog.systemId;
            let currentLevelData = xpTools.getCurrentLevel(tables[sysId].table, xpLog.xpBars[0].currentXp);
            xpLog.xpBars[0].currentLevel = Number(currentLevelData.level);

            xpLog.save()
            .then(xpLog => {
                res.status(200).json(xpLog);
            })
            .catch(err => {
                console.log(err);
                const response = {
                    Errors: ["The server rolled a natural 1.  Please try again later."]
                }
                res.status(200).json(response)
            });
        }
    });
})

module.exports = router;