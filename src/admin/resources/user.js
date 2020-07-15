'use strict';

const model = require('../../models/user_profile');
const {GROUPS} = require('./constants');


module.exports = {
  resource: model,
  options: {
    parent: GROUPS.USERS,

    properties: {
      fullName: {type: String} // fake field, added in `list` action
    },

    listProperties: [
      'username',
      'fullName',
      'email',
      'gender'
    ],

    showProperties: [
      '_id',
      'username',
      'email',
      'firstName',
      'lastName',
      'gender',
      'birthDate',
      'avatar_type.gender',
      'avatar_type.avatar_id',

      'balance.soft_coins',
      'balance.hard_coins',
      'balance.coupons',
      'balance.coupons_parts',
      'balance.money_collection',

      'collections_history',
      'createdAt',
      'updatedAt'
    ],

    actions: {
      list: {
        after(response) {
          response.records.forEach(record => {
            const {firstName, lastName} = record.params;
            record.params.fullName = [firstName, lastName]
              .filter(v => !!v)
              .join(' ');
          });

          return response;
        }
      },
      new: {isAccessible: false},
      edit: {isAccessible: false},
      delete: {isAccessible: false},
      bulkDelete: {isAccessible: false},
    }
  }
};
