'use strict';

const {STATUS_CODES} = require('http');


class HTTPError extends Error {
  constructor (httpCode, errorMessage, errorPayload) {
    super();

    this.status = httpCode;
    this.message = errorMessage || STATUS_CODES[httpCode] || 'Unknown error';
    this.details = errorPayload;

    if (httpCode === 500) {
      console.error(this.toObject());
    }
  }

  toObject() {
    const {status, message, details} = this;
    const error = {status, message};

    if (details) {
      error.details = details;
    }

    return error;
  }
}

const errorHandlerMiddleware = (err, req, res, next) => {
  if (err && err instanceof HTTPError) {
    return res
      .status(err.status)
      .send(err.toObject());
  }

  next(err);
};


module.exports = {
  HTTPError,
  errorHandlerMiddleware
};
