'use strict';

const router = require('express').Router();
const {HTTPError} = require('../error-handler-middleware');
const {createBadRequestPayload} = require('../utils');
const {sendMail} = require('../../utils/email-sender');
const Admin = require('../../../models/admin');


router.post('/reset-password', async (req, res, next) => {
  const {email} = req.fields;
  const emailRegexp = /^[\s\S]+@[\s\S]+\.[\s\S]+$/;

  if (!email || !emailRegexp.test(email)) {
    const payload = createBadRequestPayload(
      'email',
      'Field `email` is invalid'
    );
    return next(new HTTPError(400, null, payload));
  }

  const user = await Admin.findOne({email});

  if (!user) {
    const payload = createBadRequestPayload(
      'email',
      `User with email \`${email}\` not found`
    );
    return next(new HTTPError(400, null, payload));
  }

  const newPassword = Date.now().toString(36);
  const subject = 'New password from admin-panel';
  const body = `<p>Your new password: <b>${newPassword}</b></p>`;

  try {
    await sendMail(email, subject, body);
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  try {
    user.password = newPassword;
    await user.save();
  } catch (err) {
    return next(new HTTPError(500, null, err));
  }

  res.send({});
});


module.exports = {
  router
};
