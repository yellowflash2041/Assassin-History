const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Password hashing
const Schema = mongoose.Schema;

const userSchema = new Schema({
  provider: String,
  id: Number,
  token: String,
  username: String
}, {
  collection: 'fccpclone-users'
});

// Generates a hash - https://www.npmjs.com/package/bcrypt-nodejs
userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

// Returns a bool if the passwords match
userSchema.methods.validPassword = password => {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);