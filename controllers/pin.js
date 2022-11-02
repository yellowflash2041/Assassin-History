const assert = require('assert');
const chalk = require('chalk');
const Pin = require('./../models/pin');

const create = (req, res) => {
  console.log(chalk.green("We're in Pin create!"));

  assert.notEqual(req.user, undefined, 'User information required to post new Pin.');
  assert.notEqual(req.body.title, undefined, 'Pin title is missing, but required.');
  assert.notEqual(req.body.url, undefined, 'Pin URL is missing, but required.');

  const pin = new Pin({
    pinOwner: {
      userProvider: req.user.provider,
      userId: req.user.id,
      userName: req.user.username
    },
    imgUrl: req.body.url,
    title: req.body.title,
    likes: [] // Empty array
  });

  pin.save(err => {
    if (err) {
      console.log(chalk.bgRed.black('Error: ') + err);
      res.json({ status: 'ERROR' });
      return false;
    } else {
      console.log(chalk.green('Pin saved!'));
      res.json({ status: 'Pin saved!' });
      return true;
    }
  });
};

const getRecentPins = (req, res) => {
  // Use a hard-coded limit if one was not provided
  const queryLimit = (typeof res.locals.pinLimit === 'number' ? res.locals.pinLimit : 18);

  Pin.find(
    {},
    { 'pinOwner.userId': 0, 'pinOwner._id': 0 } // This is just to get in the habit of learning to exlucde info that is not necessary. Exposing unneeded or sensitive stuff can be dangerous in future apps which could handle more sensitive data
  )
    .limit(queryLimit)
    .sort({ dateCreated: -1 }) // Recent, so sort descending...
    .exec((err, docs) => {
      if (docs) {
        res.json(docs);
      } else {
        res.json({ error: 'No pins found' });
      }
    });
};

const getUserPins = (req, res) => {
  // Use a hard-coded limit if one was not provided
  const queryLimit = (typeof res.locals.pinLimit === 'number' ? res.locals.pinLimit : 48);

  if (typeof res.locals.forUserName === 'undefined' || res.locals.forUserName.length === 0) {
    res.json({ error: 'userName undefined or 0 length' });
    return false;
  }

  const forUserName = res.locals.forUserName;

  console.log(chalk.green("We're in getUserPins..."));

  Pin.find(
    { 'pinOwner.userName': forUserName },
    { 'pinOwner.userId': 0, 'pinOwner._id': 0 } // This is just to get in the habit of learning to exlucde info that is not necessary. Exposing unneeded or sensitive stuff can be dangerous in future apps which could handle more sensitive data
  )
    .limit(queryLimit)
    .sort({ dateCreated: -1 }) // Recent, so sort descending...
    .exec((err, docs) => {
      if (docs) {
        res.json(docs);
      } else {
        res.json({ error: 'No pins found' });
      }
    });
};

// Star (or unstar) a pin
const star = (req, res) => {
  console.log(chalk.cyan('Star called'));
  if (typeof req.body.pinId === 'undefined' || req.body.pinId.length !== 24) {
    res.json({ error: 'pinId undefined or not of length 24' });
    return false;
  }
  const pinId = req.body.pinId;

  // req.user is available for use because the route coming here 
  const currentUser = {
    userProvider: req.user.provider,
    userId: req.user.id,
    userName: req.user.username
  };

  Pin.findById(pinId, (err, doc) => {
    if (err) {
      console.error(err);
      res.json({ error: 'Error while retrieving pin' });
      return false;
    }

    if (doc.likes.indexOf(currentUser.toString()) === -1) {
      console.dir(doc.likes);
      doc.likes.push(currentUser);
      doc.save(err => {
        if (err) {
          res.json({ error: 'Unable to add vote' });
          return false;
        }
        console.log(chalk.green('Vote Added!'));
        res.json({ status: 'vote added' });
        return true;
      });
    } else {
      console.log(chalk.yellow("User's vote is already in the array. Removing..."));
      doc.likes.remove(currentUser);
      doc.save(err => {
        if (err) {
          res.json({ error: 'Unable to remove vote' });
          return false;
        }
        console.log(chalk.green('Vote removed!'));
        res.json({ status: 'vote removed' });
        return true;
      });
    }
  });
};

module.exports = { create, getRecentPins, getUserPins, star };
