'use strict';

const express = require('express');
const adminPanel = require('./admin-panel');

const app = express();
app.set('view engine', 'hbs');
app.set('views', 'src/admin/views');


app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.get('/reset-password', (req, res) => {
    res.render('reset-password.hbs');
});

app.use(adminPanel);

module.exports = app;
