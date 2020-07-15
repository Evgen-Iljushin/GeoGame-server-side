'use strict';

const {HTTPError} = require('./error-handler-middleware');
const {ADMIN_AUTH_ENABLED} = require('../../../config/config');


const checkAuthorisationMiddleware = (req, res, next) => {
  if (ADMIN_AUTH_ENABLED && (!req.session || !req.session.adminUser)) {
    return next(new HTTPError(
      401,
      'You need to log in to continue working with API'
    ));
  }

  next();
};


module.exports = {checkAuthorisationMiddleware};
