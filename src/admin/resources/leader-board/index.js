'use strict';

const AdminBro = require('admin-bro');
const ctrl = require('../../../controllers/leader-board_controller');
const model = require('../../../models/leader-board');
const {GROUPS} = require('../constants');


module.exports = {
  resource: model,
  options: {
    parent: GROUPS.USERS,

    listProperties: ['position', 'userId', 'isRewardGiven'],
    showProperties: ['position', 'userId', 'isRewardGiven', 'createdAt', 'updatedAt'],

    actions: {
      new: {isAccessible: false},
      edit: {isAccessible: false},
      delete: {isAccessible: false},
      bulkDelete: {isAccessible: false},

      newEvent: {
        name: 'createEvent',
        actionType: 'resource',
        icon: 'PlayFilledAlt',
        component: AdminBro.bundle('./components/new-event.jsx'),
        isAccessible: () => !ctrl.isLeaderBoardActiveSync()
      },

      aboutEvent: {
        name: 'aboutEvent',
        actionType: 'resource',
        icon: 'InformationFilled',
        component: AdminBro.bundle('./components/about-event.jsx'),
        isAccessible: () => ctrl.isLeaderBoardActiveSync()
      },

      giveOutAPrize: {
        name: 'giveOutAPrize',
        actionType: 'record',
        icon: 'Recommend',
        component: AdminBro.bundle('./components/give-reward.jsx'),
        handler: async (request, response, {record, currentAdmin}) => ({
          record: record.toJSON(currentAdmin)
        })
      }
    }
  }
};
