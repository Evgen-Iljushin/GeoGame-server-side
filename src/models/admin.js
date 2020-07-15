'use strict';

const bcrypt = require('bcryptjs');
const {Schema, model} = require('mongoose');


const schema = new Schema({
  userName: {
    type: String,
    default: 'Admin'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: value => /^[\s\S]+@[\s\S]+\.[\s\S]+$/.test(value),
      message: props => `The \`${props.value}\` is an incorrect email`
    }
  },
  salt: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  }
}, {timestamps: true});


schema.virtual('password')
  .set(function (password) {
    if (password.length < 8) {
      this.invalidate('password', 'Your password length is less than 8 characters');
      return;
    }

    const randomString = Math.random().toString(36);
    const hashString = randomString + password;

    this.salt = randomString;
    this.hash = bcrypt.hashSync(hashString, 8);
  });


// methods

schema.methods.checkPassword = async function (password) {
  const hashString = this.salt + password;
  return await bcrypt.compare(hashString, this.hash);
};


module.exports = model('Admin', schema);
