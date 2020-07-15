'use strict';

const {Schema, model} = require('mongoose');


const schema = new Schema({
  nextPosition: {
    type: Number,
    default: 1
  },
  targetMoneyAmount: {
    type: Number,
    required: true,
    validate: {
      validator: value => value > 0,
      message: props => `The \`${props.value}\` is not a correct value of the field "Target amount of money". It should be number and more than 0.`
    }
  },
  leadersLimit: {
    type: Number,
    required: true,
    validate: {
      validator: value => value > 0,
      message: props => `The \`${props.value}\` is not a correct value of the field "Maximum Amount of Leaders". It should be number and more than 0.`
    }
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});


schema.statics.getConfiguration = function() {
  return this.findOne({})
    .then(config => config || {});
};

schema.statics.startEvent = async function(configuration) {
  await this.deleteMany({});
  return this.create(configuration);
};

schema.statics.stopEvent = async function() {
  const config = await this.getConfiguration();

  config.isActive = false;
  return config.save();
};

schema.statics.incrementNextPosition = async function() {
  const config = await this.getConfiguration();

  config.nextPosition++;
  return config.save();
};


module.exports = model('EventConfiguration', schema);
