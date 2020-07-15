'use strict';

const mongoose = require('mongoose');
const router = require('express').Router();
const {startEvent, stopEvent} = require('../../../controllers/leader-board_controller');
const EventConfiguration = require('../../../models/event-configuration');
const User = require('../../../models/user_profile');
const Leader = require('../../../models/leader-board');
const {HTTPError} = require('../error-handler-middleware');
const {getPayloadFromValidationError, createBadRequestPayload} = require('../utils');


router.get('/get-info', async (req, res) => {
  res.send(await EventConfiguration.getConfiguration());
});


router.post('/create', async (req, res, next) => {
  try {
    await startEvent(req.fields);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const payload = getPayloadFromValidationError(err);
      return next(new HTTPError(400, null, payload));
    }

    return next(new HTTPError(500));
  }

  res.send(req.fields);
});


router.post('/stop', async (req, res, next) => {
  try {
    await stopEvent();
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  res.send({});
});


router.post('/give-reward', async (req, res, next) => {
  const {userId, reward, amount} = req.fields;
  let _id;

  try {
    _id = new mongoose.mongo.ObjectId(userId);
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  const user = await User.findOne({_id});

  if (!user) {
    const payload = createBadRequestPayload('id', 'This user is not found');
    return next(new HTTPError(400, null, payload));
  }

  const leader = await Leader.findOne({userId: _id});

  if (!leader) {
    const payload = createBadRequestPayload('id', 'This user is not included in the leaderboard');
    return next(new HTTPError(400, null, payload));
  }

  leader.isRewardGiven = true;

  try {
    await leader.save();
    await user.giveRewardFromLeaderBoard(reward, amount);
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  res.send({});
});


module.exports = {
  router
};
