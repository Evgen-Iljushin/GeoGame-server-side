const User = require('../models/user_profile');
const jwt = require('jsonwebtoken');
const https = require('https');

const VerifyPhoneNumber = async function (phone) {
    try {
        return await CheckPhone(phone);
    } catch (e) {
        return false;
    }
};

const AuthenticateUserCredentials = async ({username, password, socketID}) => {
    try {
        let user = await User.findByCredentials({username, password});
        return await RefreshAuthToken({userId: user._id, socketID});
    } catch (e) {
        console.log(e.message);
        throw new Error(e.message);
    }
};

const RefreshAuthToken = async function ({userId, socketID}) {
    let user = await User.findById(userId);
    const token = await user.generateExpiringAuthToken();
    user.socketID = socketID;
    await user.save(user);
    return token;
};

const CheckIfTokenIsValid = async ({access_token, callback}) => {
    try {
        const player = await User.findOne({'token': access_token}).select('_id token socketID');

        if (access_token !== player.token) {
            return callback({error: 'token expired', player: {}});
        }

        jwt.verify(player.token, process.env.JWT_SECRET, (err, data) => {
            if (err) {
                return callback({error: 'token expired', player: {}});
            }

            return callback({error: '', player});
        });
    } catch (e) {
        return callback({error: 'token expired', player: {}});
    }
};



const AuthenticateByFB = async ({fb_verification_token, socketID, callback}) => {
    try{
        https.get(`https://graph.facebook.com/debug_token?
        input_token=${fb_verification_token}&access_token=${process.env.FB_APP_TOKEN}`,
        (res) => {
            res.on('data', async (result) => {
                let fbData = JSON.parse(result);
                if(!fbData.data.error){
                    try {
                        let user = await User.FindUserByFacebookId(fbData.data.user_id);
                        if(user.error == ''){
                            let token = await RefreshAuthToken({userId: user.user._id, socketID});
                            return callback({token: token, isNewAccount: 'false'});
                        } else if(user.error == 'No such profile'){
                            return callback({isNewAccount: 'true'});
                        } else {
                            return callback({error: user.error});
                        }

                    } catch (e) {
                        throw new Error(e.message);
                    }
                } else {
                    return callback({error: `${fbData.data.error.message}`});
                }
            });

        }).on('error', (e) => {
            console.error(e);
        });

    } catch (e){
        return callback({error: e});
    }
};


const RegistrationByFB = async ({fb_verification_token, socketID, callback}) => {
    try{
        https.get(`https://graph.facebook.com/debug_token?
        input_token=${fb_verification_token}&access_token=${process.env.FB_APP_TOKEN}`,
            (res) => {
                res.on('data', async (result) => {

                    let resultToken = JSON.parse(result);
                    https.get(`https://graph.facebook.com/v6.0/me?${resultToken.user_id}
                        &access_token=${fb_verification_token}
                        &fields=id,name,birthday,email,first_name,last_name,languages,gender`,
                        (res) => {
                            res.on('data', async (result) => {

                                let userFbData = JSON.parse(result);
                                if(!userFbData.error){
                                    return callback(userFbData);
                                } else {
                                    return callback({error: userFbData.error.message});
                                }
                            });

                        }).on('error', (e) => {
                        console.error(e);
                        return callback({error: 'err get user data'});
                    });
                });

            }).on('error', (e) => {
            console.error(e);
            return callback({error: `token_fb expired. Error message: ${e}`});
        });

    } catch (e){
        return callback({error: 'token_fb expired'});
    }
};




const ResetPhoneToken = async function (socketID) {
    const player = await User.findOne({'socketID': socketID});
    return await player.generateExpiringAuthToken();
};

const ResetFBToken = async function (socketID) {
    // const player = await User.findOne({'socketID': socketID});
    // return await player.generateExpiringAuthToken('Phone');
};

exports = module.exports = {
    VerifyPhoneNumber,
    CheckIfTokenIsValid,
    RefreshAuthToken,
    AuthenticateUserCredentials,
    ResetPhoneToken,
    AuthenticateByFB,
    RegistrationByFB
};
