'use strict';

const model = require('../../models/admin');
const {GROUPS} = require('./constants');


module.exports = {
  resource: model,
  options: {
    parent: GROUPS.USERS,

    properties: {
      password: {type: String} // virtual field of the model
    },

    listProperties: ['userName', 'email'],
    showProperties: ['_id', 'userName', 'email', 'createdAt', 'updatedAt'],
    editProperties: ['userName', 'email', 'password'],

    actions: {
      new: {isAccessible: false},
      delete: {isAccessible: false},
      bulkDelete: {isAccessible: false},
    }
  }
};
