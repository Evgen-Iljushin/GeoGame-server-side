'use strict';

const express = require('express');
const formidableMiddleware = require('express-formidable');
const AdminBro = require('admin-bro');

const buildRouter = require('./router');
const {/* ADMIN_PANEL_LOGO_PATH, */ ADMIN_PANEL_PRODUCT_NAME} = require('../../config/config');

// db adapter
AdminBro.registerAdapter(require('admin-bro-mongoose'));


const app = express();
app.use(formidableMiddleware());

const adminBro = new AdminBro({
  rootPath: '/admin',
  branding: {
    // logo: ADMIN_PANEL_LOGO_PATH,
    companyName: ADMIN_PANEL_PRODUCT_NAME,
    softwareBrothers: false
  },
  resources: [
    require('./resources/admin'),
    require('./resources/user'),
    require('./resources/leader-board'),

    require('./resources/spot'),
  ],
  locale: {
    translations: {
      labels: {
        Admin: 'Admin Data',
        Leader: 'Leader-board',
        User: 'Users'
      }
    }
  },
  assets: {
    styles: ['/css/admin-panel.css']
  }
});


app.use(
  adminBro.options.rootPath,
  buildRouter(adminBro)
);

app.use(
  `${adminBro.options.rootPath}/custom-api`,
  require('./custom-api').router
);

app.all(`${adminBro.options.rootPath}/*`, (req, res) => {
  res.redirect(adminBro.options.rootPath);
});



module.exports = app;
