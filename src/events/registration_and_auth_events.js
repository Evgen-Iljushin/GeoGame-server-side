function RegistrationAndAuthEvents({io, socket}) {
    this.io = io;
    this.socket = socket;
    return this;
}

const {
    AuthenticateUserCredentials,
    CheckIfTokenIsValid,
    RefreshAuthToken,
    AuthenticateByFB,
    RegistrationByFB
} = require('../utils/auth');

const UsersController = require('../controllers/users_controller');

RegistrationAndAuthEvents.prototype.Listen = async function () {
    const thisEvents = this;

    thisEvents.socket.on('test-event', async (userParameters, callback) => {
        return callback('Test event received')
    });

    thisEvents.socket.on('Registration_Username', async ({firstName, lastName, username, email, password, gender, birthDate}, callback) => {
        const registrationResult = await UsersController.CreateNewUserByUsername({
            firstName,
            lastName,
            username,
            email,
            password,
            gender,
            birthDate,
            socketID: thisEvents.socket.id
        });

        return callback(registrationResult);
    });

    thisEvents.socket.on('Login_Username', async ({username, password}, callback) => {
        let authResult;
        try {
            authResult = await AuthenticateUserCredentials({username, password, socketID: thisEvents.socket.id});
            console.log(`Client ${thisEvents.socket.id} just LOGINED_BY_PHONE`);

            return callback({
                error: '',
                access_token: authResult,
                socketID: thisEvents.socket.id
            });
        } catch (e) {
            return callback({
                error: e.message,
                access_token: '',
                socketID: ''
            });
        }
    });

    thisEvents.socket.on('Registration_FB', async ({fb_verification_token}, callback) => {
        await RegistrationByFB({
            fb_verification_token: fb_verification_token,
            socketID: thisEvents.socket.id,
            callback: async (fbData) => {
                if (!fbData.error) {

                    let newUsername = `user_${(+new Date).toString(16)}`;

                    async function generatePassword() {
                        let length = 8,
                            letters = "abcdefghijklmnopqrstuvwxyz",
                            digits = "0123456789",
                            retVal = "";
                        for (let i = 0, n = letters.length; i < length; ++i) {
                            retVal += letters.charAt(Math.floor(Math.random() * n)) +
                                digits.charAt(Math.floor(Math.random() * n));
                        }
                        return retVal;
                    }

                    let password = await generatePassword();
                    let gender = '';

                    switch (fbData.gender) {
                        case 'male':
                            gender = 'Male'
                            break
                        case 'female':
                            gender = 'Female'
                            break
                        case 'none':
                            gender = 'None'
                    }


                    const registrationResult = await UsersController.CreateNewUserByUsername({
                        firstName: fbData.first_name,
                        lastName: fbData.last_name,
                        newUsername,
                        email: fbData.email,
                        password,
                        gender: gender,
                        birthDate: fbData.birthday,
                        socketID: thisEvents.socket.id,
                        facebookId: fbData.id
                        });

                    return callback(registrationResult);

                } else {
                    return callback({error: fbData.error});
                }

            }
        })
    });

    thisEvents.socket.on('Login_FB', async ({fb_verification_token}, callback) => {
        await AuthenticateByFB({
            fb_verification_token: fb_verification_token,
            socketID: thisEvents.socket.id,
            callback: async (result) => {

                if (!result.error) {
                    try {
                        if(result.isNewAccount == 'true'){
                            return callback({
                                error: '',
                                access_token: '',
                                socketID: thisEvents.socket.id,
                                isNewAccount: 'true'
                            })
                        } else {
                            return callback({
                                error: '',
                                access_token: result.token,
                                socketID: thisEvents.socket.id,
                                isNewAccount: 'false'
                            })
                        }

                    } catch (e) {
                        return callback({error: e});
                    }

                } else {
                    return callback({error: result.error});
                }
            }
        })

    });

    thisEvents.socket.on('Authenticate', async ({access_token}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const newToken = await RefreshAuthToken({
                            userId: result.player._id,
                            socketID: thisEvents.socket.id
                        });
                        console.log(`Client ${thisEvents.socket.id} just GOT_AUTHENTICATED`);
                        return callback({error: '', access_token: newToken, socketID: thisEvents.socket.id});
                    } catch (e) {
                        console.log(e);
                        return callback({error: e});
                    }

                }
                return callback({error: result.error});
            }
        });
    });
};

exports = module.exports = RegistrationAndAuthEvents;
