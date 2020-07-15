'use strict';

const moongoose = require('mongoose');
const loadFixtures = require('./fixtures');

moongoose.connect(process.env.MONGODB_WEBTOKEN, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
});

loadFixtures();
