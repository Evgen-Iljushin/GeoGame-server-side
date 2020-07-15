'use strict';

const User = require('../models/user_profile');
const Leader = require('../models/leader-board');
const EventConfiguration = require('../models/event-configuration');


// костиль для нового бага адмінки
let _isLeaderBoardActiveSync = null;

const updateSyncValue = async () => {
  _isLeaderBoardActiveSync = await isLeaderBoardActive();
};
const isLeaderBoardActiveSync = () => {
  return _isLeaderBoardActiveSync;
}


/**
 * Clears the latest leader-board and saves the config of a new event in the DB with `isActive` as `true`
 *
 * @param {Object} eventConfig
 * @param {number} eventConfig.targetMoneyAmount - the amount of money that the user should receive
 * @param {number} eventConfig.leadersLimit - the max amount of event leaders
 * @param {number} eventConfig.eventDuration - the event duration in ms
 *
 * @return {Promise<undefined>}
 */
const startEvent = async ({targetMoneyAmount, leadersLimit, eventDuration}) => {
  _isLeaderBoardActiveSync = true;

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + eventDuration);

  await Leader.deleteMany({});
  await EventConfiguration.startEvent({targetMoneyAmount, leadersLimit, startTime, endTime});
};


/**
 * Changes prop `isActive` of the EventConfiguration to `false`
 *
 * @return {Promise<undefined>}
 */
const stopEvent = async () => {
  _isLeaderBoardActiveSync = false;
  await EventConfiguration.stopEvent();
};


/**
 * Returns `isActive` property of event
 *
 * @return {Promise<boolean>}
 */
const isLeaderBoardActive = async () => {
  return (await EventConfiguration.getConfiguration()).isActive || false;
};


const isLeaderBoardFull = async ({isActive, leadersLimit}) => {
  if (!isActive) {
    return false;
  }

  const leadersCount = await Leader.count({});

  return leadersLimit === leadersCount;
};


const isLeaderBoardExpired = ({endTime}) => Date.now() >= endTime;


const createLeader = async ({nextPosition: position}, userId) => {
  await EventConfiguration.incrementNextPosition();

  return new Leader({position, userId}).save();
};


const checkThatUserHaveReceivedTargetMoneyAmount = async ({startTime, targetMoneyAmount}, userId) => {
  const isUserInLeaderBoard = await Leader.count({userId: userId}) > 0;

  if (isUserInLeaderBoard) {
    return false;
  }

  const [{amount}] = await User.aggregate()
    .match({_id: userId})
    .unwind("collections_history")
    .match({'collections_history.reward_type': 'money'})
    .match({'collections_history.collected_at': {$gte: startTime}})
    .group({_id: "_id", amount: {$sum: '$collections_history.collected_amount'}});

  return amount >= targetMoneyAmount;
};


/**
 * Check that the user is a leader and add it to the leader-board.
 * Also can stop the event if it is expired.
 * Also can stop the event if the leader-board will be full after adding a new leader.
 *
 * @param {ObjectId} userId
 * @return {Promise<boolean>} - the user has been added to the leader-board or not
 */
const addUserToLeaderBoardIfTargetMoneyAmountIsCollected = async userId => {
  const eventConfig = await EventConfiguration.getConfiguration();

  if (isLeaderBoardExpired(eventConfig)) {
    _isLeaderBoardActiveSync = false;
    await stopEvent();
    return false;
  }

  const isUserMatchedCriteria = await checkThatUserHaveReceivedTargetMoneyAmount(eventConfig, userId);
  if (!isUserMatchedCriteria) {
    return false;
  }

  await createLeader(eventConfig, userId);

  if (await isLeaderBoardFull(eventConfig)) {
    _isLeaderBoardActiveSync = false;
    await stopEvent();
  }

  return true;
};


// продовження костилю для адмінки
updateSyncValue();


module.exports = {
  startEvent,
  stopEvent,
  isLeaderBoardActive,
  isLeaderBoardActiveSync,
  addUserToLeaderBoardIfTargetMoneyAmountIsCollected,
};
