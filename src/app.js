'use strict'

const express = require('express');

const app = express();
const path = require('path');
const adminPanel = require('./admin');
const publicDirectoryPath = path.join(__dirname, '../public');

require('./db/mongoose');


app.use(adminPanel);
app.use(express.static(publicDirectoryPath));
app.use(express.json());

app.get('/test', (req, res) => {
    res.sendFile(publicDirectoryPath + '/index.html');
});


module.exports = app;
