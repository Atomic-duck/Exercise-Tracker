const mongoose = require('mongoose')

const LogScheme = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String
},{
  _id: false
})

const UserScheme = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  count: Number,
  log: [LogScheme]
},{
  versionKey: false
})

module.exports = mongoose.model('User', UserScheme)