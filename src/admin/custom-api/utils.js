'use strict';

const getPayloadFromValidationError = err => Object
  .entries(err.errors)
  .map(([path, {message}]) => ({path, message}));


const createBadRequestPayload = (path, message) => [{path, message}];

module.exports = {
  getPayloadFromValidationError,
  createBadRequestPayload
};
