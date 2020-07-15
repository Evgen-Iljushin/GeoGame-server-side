'use strict';

const mongoose = require('mongoose');
const Spot = require('../../../models/spot');
const {HTTPError} = require('../error-handler-middleware');
const {createBadRequestPayload, getPayloadFromValidationError} = require('../utils');
const {readBufferFromFile} = require('./utils');

const router = require('express').Router();


router.get('/:id/photo', async (req, res, next) => {
  const {id} = req.params;
  let _id;

  try {
    _id = new mongoose.mongo.ObjectId(id);
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  const spot = await Spot.findOne({_id});

  if (!spot) {
    const payload = createBadRequestPayload('id', 'This spot is not found');
    return next(new HTTPError(400, null, payload));
  }

  res.send(spot.icon);
});


router.post('/:id/photo', async (req, res, next) => {
  const {id} = req.params;
  const {image} = req.files;
  let _id;

  try {
    _id = new mongoose.mongo.ObjectId(id);
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  const spot = await Spot.findOne({_id});

  if (!spot) {
    const payload = createBadRequestPayload('id', 'This spot is not found');
    return next(new HTTPError(400, null, payload));
  }

  let buffer = null;

  if (image) {
    buffer = await readBufferFromFile(image);
  }

  spot.icon = buffer;

  try {
    await spot.save();
  } catch (err) {
    if (err.name === 'ValidationError') {
      const payload = getPayloadFromValidationError(err);
      return next(new HTTPError(400, null, payload));
    }

    return next(new HTTPError(500));
  }

  res.send({});
});


module.exports = {
  router
};
