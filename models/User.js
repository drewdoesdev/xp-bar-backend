const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String,
    default: ""
  }
  /*xpLogs: [{
    type: Schema.Types.ObjectId,
    ref: 'XpLog',
    default: []
  }]*/
});

module.exports = User = mongoose.model("users", UserSchema);