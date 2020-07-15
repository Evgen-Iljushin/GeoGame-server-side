'use strict';

const User = require('../../models/user_profile');
const Leader = require('../../models/leader-board');


const LEADERS_COUNT = 2;

const getUserIds = async () => {
  const users = await User
    .find({})
    .limit(LEADERS_COUNT);

  if (users.length === LEADERS_COUNT) {
    return users.map(u => u._id);
  }

  const needToCreate = LEADERS_COUNT - users.length;

  const promises = Array
    .from({length: needToCreate})
    .map(() => new User({
      username: 'User ' + Date.now(),
      email: 'q' + Date.now() + Math.random() + '@q.com',
      password: '12345qwerty',
      socketID: 'qwerty'
    }).save());

  const createdUsers = await Promise.all(promises);

  return [
    ...users,
    ...createdUsers
  ].map(u => u._id);
};


module.exports = async () => {
  const leader = await Leader.findOne({});

  if (leader) {
    return;
  }

  const [id1, id2] = await getUserIds();

  const leadersData = [
    {position: 1, userId: id1},
    {position: 2, userId: id2}
  ];

  leadersData.forEach(data => new Leader(data).save());
};
