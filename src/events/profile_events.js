const usersController = require('../controllers/users_controller');

function ProfileEvents({io, socket}) {
    this.io = io;
    this.socket = socket;
    return this;
}

const {
    CheckIfTokenIsValid
} = require('../utils/auth');

ProfileEvents.prototype.Listen = async function () {
    const thisEvents = this;

    thisEvents.socket.on('Get_Profile', async ({access_token, profileOwnerSocketID}, callback) => {
        //{profile:{
        // username:"xxxx",
        // balance:{xxxx}
        // }}
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const userProfile = await usersController.GetUserProfile(profileOwnerSocketID);
                        console.log(`Client ${thisEvents.socket.id} just requested profile info`);
                        return callback({error: '', profile: userProfile});

                    } catch (e) {
                        return callback({error: e.message, profile: {}});
                    }
                }
                return callback({error: result.error, profile: {}});
            }
        });
    });

    thisEvents.socket.on('Update_Profile', async ({access_token, updates}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const updatedProfile = await usersController.UpdateProfile({
                            access_token,
                            parametersToUpdate: updates
                        });
                        console.log(`Client ${thisEvents.socket.id} just requested profile change`);
                        return callback({error: ''});

                    } catch (e) {
                        return callback({error: e.message});
                    }
                }
                return callback({error: result.error});
            }
        });
    });

    thisEvents.socket.on('Get_Profile_Image', async ({access_token, avatarOwnerSocketId}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const image = await usersController.GetUserPhoto(avatarOwnerSocketId);
                        console.log(`Client ${thisEvents.socket.id} just requested profile photo for ${avatarOwnerSocketId}`);
                        return callback({error: '', image: image.photo.photo});

                    } catch (e) {
                        return callback({error: e.message, image: null});
                    }
                }
                return callback({error: result.error, image: null});
            }
        });
    });

    thisEvents.socket.on('Update_Profile_Image', async ({access_token, newImage}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const image = await usersController.ChangePhoto({access_token, newPhoto: newImage});
                        console.log(`Client ${thisEvents.socket.id} just requested update for profile image`);
                        return callback({error: ''});

                    } catch (e) {
                        return callback({error: e.message});
                    }
                }
                return callback({error: result.error});
            }
        });
    });

    thisEvents.socket.on('Update_User_Avatar', async ({access_token, newAvatarID, newAvatarGender}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        await usersController.ChangeAvatar({access_token, newAvatarID, newAvatarGender});
                        console.log(`Client ${thisEvents.socket.id} just requested update for avatar`);
                        return callback({error: ''});

                    } catch (e) {
                        return callback({error: e.message});
                    }
                }
                return callback({error: result.error});
            }
        });
    });
};

exports = module.exports = ProfileEvents;