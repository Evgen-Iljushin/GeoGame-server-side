const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const passwordValidator = require('password-validator');
const {REWARDS, REWARDS_ENUM} = require('./constants');


const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(7)
    .has().letters()
    .has().digits()
    .has().not().spaces();


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: '',
        trim: true
    },
    lastName: {
        type: String,
        default: '',
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    birthDate: {
        type: Date
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!passwordSchema.validate(value)) {
                throw new Error('Password should be at least 7 characters long, must have letters and digits and don\'t have spaces.');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value.replace(/\s/g, ""), {strictMode: true})) {
                throw new Error('Invalid email');
            }
        }
    },
    photo: {
        type: Buffer
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'None'],
        default: 'None'
    },
    avatar_type: {
        gender: {
            type: String,
            enum: ['Male', 'Female', 'None'],
            default: 'None'
        },
        avatar_id: {
            type: Number,
            default: 0
        }
    },
    balance: {
        soft_coins: {
            type: Number,
            default: 0
        },
        coupons: {
            type: Number,
            default: 0
        },
        coupons_parts: {
            type: Number,
            default: 0
        },
        hard_coins: {
            type: Number,
            default: 0
        },
        money_collection: {
            type: Number,
            default: 0
        },
        stores: [{
            spot_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Spots'
            },
            current_balance: {
                type: Number,
                required: true
            }
        }]
    },
    collections_history: [{
        spot_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Spots'
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
    token: {
        type: String,
    },
    facebookId: {
        type: String,
    },
    socketID: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

userSchema.statics.findByCredentials = async function ({username, password}) {
    const user = await User_profile.findOne({'username': username});

    if (!user) {
        return ({error: 'No such user'});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return ({error: 'Wrong password'});
    }
    return user;
};

userSchema.statics.FindUserByFacebookId = async (facebookId) => {
    const user = await User_profile.findOne({'facebookId': facebookId});

    if (!user) {
        return {error: 'No such profile', user: null}
    }

    return {error: '', user}
};

//Use this for the regular auth tokens generations.
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

    user.token = token;
    await user.save();
    return token;
};

//Use this to make an offline token to login after the logout.
userSchema.methods.generateExpiringAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: "1d"});

    user.token = token;
    await user.save();

    return token;
};

userSchema.methods.giveRewardFromLeaderBoard = async function (rewardType, amount) {
    switch (rewardType) {
        case REWARDS.MONEY:
            this.balance.money_collection += amount;
            break;
        case REWARDS.COUPONS:
            this.balance.coupons += amount;
            break;
        case REWARDS.COUPONS_PARTS:
            this.balance.coupons_parts += amount;
            break;
        case REWARDS.SOFT_CURRENCY:
            this.balance.soft_coins += amount;
            break;
        case REWARDS.HARD_CURRENCY:
            this.balance.hard_coins += amount;
            break;
    }

    await this.save();
};

userSchema.methods.collectSpot = async function (spot) {
    const user = this;

    const rewardRecord = {
        spot_id: spot._id,
        reward_type: spot.reward.reward_type,
        collected_amount: spot.reward.reward_amount
    };

    user.collections_history.push(rewardRecord);

    console.log(spot.reward.reward_type);

    switch (spot.reward.reward_type) {
        case REWARDS.MONEY: {
            user.balance.money_collection ? user.balance.money_collection += spot.reward.reward_amount : user.balance.money_collection = spot.reward.reward_amount;
            break;
        }
        case REWARDS.COUPONS: {
            user.balance.coupons ? user.balance.coupons += spot.reward.reward_amount : user.balance.coupons = spot.reward.reward_amount;
            break;
        }
        // case REWARDS.COUPONS_PARTS: {
        //     user.balance.money_collection += spot.reward.reward_amount;
        //     break;
        // }
        case REWARDS.SOFT_CURRENCY: {
            user.balance.soft_coins ? user.balance.soft_coins += spot.reward.reward_amount : user.balance.soft_coins = spot.reward.reward_amount;
            break;
        }
        case REWARDS.HARD_CURRENCY: {
            user.balance.hard_coins ? user.balance.hard_coins += spot.reward.reward_amount : user.balance.hard_coins = spot.reward.reward_amount;
            break;
        }
    }

    await user.save();
    rewardRecord.spot_id = spot.spot_id;

    return rewardRecord;
};

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

const User_profile = mongoose.model('User_profile', userSchema);

exports = module.exports = User_profile;

