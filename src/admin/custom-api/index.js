'use strict';

const router = require('express').Router();
const {errorHandlerMiddleware} = require('./error-handler-middleware');
const {checkAuthorisationMiddleware} = require('./check-authorisation-middleware');


router.use(checkAuthorisationMiddleware);
router.use('/events', require('./events').router);
router.use('/spot', require('./spot').router);
router.use('/usr', require('./usr').router);
router.use(errorHandlerMiddleware);


module.exports = {
    router
};
