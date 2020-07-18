const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const XpLogSchema = new Schema({
    name: [String],
    xpTableType: [String],
    xpBars: [XpBarSchema]
});

const XpBarSchema = new Schema({
    characterName: [String], 
    currentXp: [Number],
    deeds: [DeedSchema]
})

const DeedSchema = new Schema({
  description: [String],
  xpRewarded: [Number]
})

module.exports = XpLog = mongoose.model("xpLogs", XpLogSchema);