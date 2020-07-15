'use strict';

const AdminBro = require('admin-bro');
const model = require('../../../models/spot');
const {GROUPS} = require('../constants');


module.exports = {
  resource: model,
  options: {
    parent: GROUPS.SPOTS,

    listProperties: [
      'spot_name',
      'coordinates',
      'reward.reward_type'
    ],

    showProperties: [
      '_id',
      'spot_id',
      'spot_name',
      'description',
      'coordinates',
      'reward.reward_type',
      'reward.reward_amount',
      'createdAt',
      'updatedAt'
    ],

    editProperties: [
      'spot_name',
      'description',
      'coordinates',
      'reward.reward_type',
      'reward.reward_amount'
    ],

    actions: {
      setPhoto: {
        name: 'setPhoto',
        actionType: 'record',
        icon: 'Image',
        component: AdminBro.bundle('./components/set-photo.jsx'),
        handler: async (request, response, {record, currentAdmin}) => ({
          record: record.toJSON(currentAdmin)
        })
      }
    }
  }
};
