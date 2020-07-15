'use strict';

const mailer = require('nodemailer');


const {
  MAILER_SMTP_HOST,
  MAILER_SMTP_PORT,
  MAILER_SMTP_USER,
  MAILER_SMTP_PASSWORD,
  MAILER_FROM
} = process.env;

const SECURE_PORT = 465;
const TEST_SMTP_HOST = 'smtp.ethereal.email';
const IS_TEST_MODE = MAILER_SMTP_HOST === TEST_SMTP_HOST;


const createTransport = async () => {
  let user = MAILER_SMTP_USER;
  let pass = MAILER_SMTP_PASSWORD;

  if (IS_TEST_MODE) {
    const testAccount = await mailer.createTestAccount();
    user = testAccount.user;
    pass = testAccount.pass;
  }

  return mailer.createTransport({
    host: MAILER_SMTP_HOST,
    port: MAILER_SMTP_PORT,
    secure: MAILER_SMTP_PORT === SECURE_PORT,
    auth: {user, pass}
  });
};


const sendMail = async (to, subject, html) => {
  const transport = await createTransport();
  const from = MAILER_FROM;

  const info = await transport.sendMail({from, to, subject, html});

  if (IS_TEST_MODE) {
    console.log('Email message info:', info);
  }

  return info;
};


module.exports = {sendMail};
