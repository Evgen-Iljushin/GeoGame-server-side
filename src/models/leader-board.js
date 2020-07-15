'use strict';

const {Schema, model} = require('mongoose');


const schema = new Schema({
  position: {
    type: Number
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User_profile'
  },
  isRewardGiven: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

module.exports = model('Leader', schema);
