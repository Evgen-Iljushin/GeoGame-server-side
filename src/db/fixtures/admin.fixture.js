'use strict';

const Admin = require('../../models/admin');
const {ADMIN_FIXTURE_EMAIL, ADMIN_FIXTURE_PASSWORD} = require('../../../config/config');

module.exports = async () => {
  const admin = await Admin.findOne({});

  if (!admin) {
    new Admin({
      email: ADMIN_FIXTURE_EMAIL,
      password: ADMIN_FIXTURE_PASSWORD
    }).save();
  }
};
