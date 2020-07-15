const mongoose = require('mongoose');
const crypto = require('crypto');
const passwordValidator = require('password-validator');
const {REWARDS_ENUM} = require('./constants');


const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(7)
    .has().letters()
    .has().digits()
    .has().not().spaces();


const coordinatesSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    altitude: {
        type: Number,
        required: true
    },
});


const spotSchema = new mongoose.Schema({
    spot_id: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(32).toString('hex')
    },
    spot_name: {
        type: String,
        default: () => 'Spot_' + Math.floor((Math.random() * 100) + 1)
    },
    description: {
        type: String,
        default: ''
    },
    icon: Buffer,
    coordinates: {
        type: coordinatesSchema,
        required: true
    },
    reward: {
        reward_type: {
            type: String,
            enum: REWARDS_ENUM,
            required: true
        },
        reward_amount: {
            type: Number,
            required: true,
            validate: {
                validator: value => value > 0,
                message: props => `This field must be more than zero`
            }
        }
    },
    collections_history: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User_profile'
        },
        collected_at: {
            type: Date,
            default: Date.now
        },
        reward_type: {
            type: String,
            enum: REWARDS_ENUM,
            required: true
        },
        collected_amount: {
            type: Number,
            required: true
        }
    }],
    isEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

spotSchema.methods.collectSpot = async function (userId) {
    const spot = this;

    const rewardRecord = {
        user_id: userId,
        reward_type: spot.reward.reward_type,
        collected_amount: spot.reward.reward_amount
    };

    spot.collections_history.push(rewardRecord);
    await spot.save();

    return rewardRecord;
};

spotSchema.methods.getSpotGeneralInfo = async function () {
    const spot = this;

    return {
        spot_id: spot.spot_id,
        spot_name: spot.spot_name,
        description: spot.description,
        coordinates: spot.coordinates,
        reward: spot.reward
    };
};

const Spot = mongoose.model('Spot', spotSchema);

exports = module.exports = Spot;