'use strict';

const checkAndCreateAdmin = require('./admin.fixture');
// const _testLeaders = require('./test-leaders.fixture');

module.exports = async () => {
  await checkAndCreateAdmin();

  // test fixtures
  // await _testLeaders();
};
