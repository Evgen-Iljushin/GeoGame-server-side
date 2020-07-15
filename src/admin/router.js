'use strict';

const AdminBroExpress = require('admin-bro-expressjs');
const AdminModel = require('../models/admin');
const {ADMIN_AUTH_ENABLED} = require('../../config/config');


const {ADMINPANEL_COOKIE_PASS} = process.env;

if (!ADMINPANEL_COOKIE_PASS) {
  throw new Error('`ADMINPANEL_COOKIE_PASS` must be stored in .env-file');
}


const sessionOptions = {
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: process.env.LOGIN_COOKIE_MAX_AGE
  }
};

const authConfig = {
  cookiePassword: ADMINPANEL_COOKIE_PASS,
  authenticate: async (email, password) => {
    const user = await AdminModel.findOne({email});

    return user && user.checkPassword(password)
      ? user
      : false;
  },
};


module.exports = (adminPanelInstance, router = null) => {
  return ADMIN_AUTH_ENABLED
    ? AdminBroExpress.buildAuthenticatedRouter(adminPanelInstance, authConfig, router, sessionOptions)
    : AdminBroExpress.buildRouter(adminPanelInstance);
};
