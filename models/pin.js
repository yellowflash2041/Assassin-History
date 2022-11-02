const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const pinOwnerSchema = new Schema({
  userProvider: String,
  userId: Number,
  userName: String
});

const pinSchema = new Schema({
  dateCreated: { type: Date, default: Date.now },
  pinOwner: [pinOwnerSchema],
  imgUrl: String,
  title: String,
  likes: Array
}, {
  collection: 'fccpclone-pins'
});

module.exports = mongoose.model('Pin', pinSchema);