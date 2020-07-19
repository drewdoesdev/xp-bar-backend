const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeedSchema = new Schema({
  description: [String],
  xpRewarded: [Number],
  date: {
    type: [Date],
    default: Date.now
  }
})

const XpBarSchema = new Schema({
    name: String,
    character: Object, //Character schema to be added in 3.0 
    currentXp: Number,
    deeds: [DeedSchema]
});

const XpLogSchema = new Schema({
  name: String,
  userId: String,
  type: String,
  systemId: String,
  xpBars: [XpBarSchema]
});

module.exports = {
  XpLog: mongoose.model("logs", XpLogSchema),
  XpBar: mongoose.model("xpBars", XpBarSchema)
};