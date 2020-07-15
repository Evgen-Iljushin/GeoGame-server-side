const UserProfile = require('../models/user_profile');

//todo add redis representation of this data


const FindUserById = async (userId) => {
    const user = await UserProfile.findById(userId);

    if (!user) {
        return {error: 'No such profile', user: null}
    }

    return {error: '', user}
};

const FindUserBySocketId = async (socketID) => {
    const user = await UserProfile.findOne({'socketID': socketID});
    if (!user) {
        return {error: 'No such profile', user: null}
    }

    return {error: '', user}
};

const FindUserByAccessToken = async (access_token) => {
    const user = await UserProfile.findOne({'token': access_token});

    if (!user) {
        return {error: 'No such profile', user: null}
    }

    return {error: '', user}
};

const FindUserMail = async (email) => {
    const user = await UserProfile.findOne({email});

    if (!user) {
        return {error: 'No such profile', user: null}
    }

    return {error: '', user}
};

const FindUserUsername = async (username) => {
    const user = await UserProfile.findOne({username});

    if (!user) {
        return {error: 'No such profile', user: null}
    }

    return {error: '', user}
};

const CreateNewUserByUsername = async function ({firstName, lastName, username, email, password, gender, birthDate, socketID, facebookId = ''}) {
    try {
        const existingUser = await FindUserMail(email);
        if (!existingUser.error) {
            //todo add implementation for user already exists
            return {error: 'User with this username already exists'}
        }

        const user = new UserProfile({
            firstName,
            lastName,
            username,
            email,
            password,
            gender,
            birthDate,
            socketID,
            facebookId
        });

        const savedUser = await user.save(user);
        await savedUser.generateExpiringAuthToken();

        return {error: "", access_token: savedUser.token, socketID: socketID};
    } catch (e) {
        return {error: e.message, accessToken: ""};
    }
};

// const DeleteUserById = async function (id) {
//     try {
//         const existingUser = await FindUserById(id);
//         if (!existingUser.error) {
//             //todo add implementation for user already exists
//             return {error: 'No such user'}
//         }
//
//         existingUser.
//
//         const savedUser = await user.save(user);
//         await savedUser.generateExpiringAuthToken();
//
//         return {error: "", accessToken: savedUser.token, player: savedUser};
//     } catch (e) {
//         return {error: e, accessToken: ""};
//     }
// };

// const DeleteUserByMail = async function (email) {
//     try {
//         //todo add implementation
//     } catch (e) {
//
//     }
// };

const ChangeAvatar = async function ({access_token, newAvatarID, newAvatarGender}) {
    try {
        const {user, error} = await FindUserByAccessToken(access_token);

        user.avatar_type.gender = newAvatarGender ? newAvatarGender : user.avatar_type.gender;
        user.avatar_type.avatar_id = newAvatarID ? newAvatarID : user.avatar_type.avatar_id;
        await user.save(user);

        return {error: ''};
    } catch (e) {
        return {error: e.message};
    }
};

const ChangePhoto = async function ({access_token, newPhoto}) {
    try {
        const user = await FindUserByAccessToken(access_token);
        user.photo = Buffer.from(newPhoto);
        await user.save(user);

        return {error: ''};
    } catch (e) {
        return {error: e.message};
    }
};

const UpdateProfile = async function ({access_token, parametersToUpdate}) {
    const updates = Object.keys(parametersToUpdate);
    const allowedUpdates = ['firstName', 'lastName', 'username', 'phoneNumber', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return {error: 'Invalid updates!'};
    }

    const user = await FindUserByAccessToken(access_token);

    if (!user || user.error) {
        return {error: 'No such user'};
    }

    try {
        updates.forEach((update) => user.user[update] = parametersToUpdate[update]);
        await user.user.save(user.user);
        return {error: ''};
    } catch (e) {
        console.log(e.message);
        return {error: e.message};
    }
};

const GetUserBalance = async function (access_token) {
    try {
        const user = await UserProfile.findOne({'token': access_token}).select('-_id balance');

        if (!user) {
            return {error: 'No such user'};
        }
        return {error: '', balance: user};
    } catch (e) {
        return {error: e.message};
    }
};

const GetUserPhoto = async function (socketID) {
    try {
        const user = await UserProfile.findOne({'socketID': socketID}).select('-_id photo');

        if (!user) {
            return {error: "No such user"};
        }
        return {error: "", photo: user};
    } catch (e) {
        return {error: e.message};
    }
};

const GetUserProfile = async function (socketID) {
    try {
        const user = await UserProfile.findOne({'socketID': socketID}).select('-_id firstName lastName username balance avatar_type');

        if (!user) {
            return {error: "No such user"};
        }
        return {error: "", profile: user};
    } catch (e) {
        return {error: e.message};
    }
};

const GetUserSpotsHistory = async function (socketID) {
    try {
        const user = await UserProfile.findOne({'socketID': socketID}).select('-_id collections_history');

        if (!user) {
            return {error: "No such user"};
        }
        return {error: "", history: user};
    } catch (e) {
        return {error: e.message};
    }
};

exports = module.exports = {
    FindUserBySocketId,
    CreateNewUserByUsername,
    ChangeAvatar,
    ChangePhoto,
    UpdateProfile,
    GetUserPhoto,
    GetUserBalance,
    GetUserProfile,
    GetUserSpotsHistory
};
