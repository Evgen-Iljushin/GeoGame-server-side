const UserProfile = require('../models/user_profile');
const Spot = require('../models/spot');
const Users = require('./users_controller');
const sharp = require('sharp');

//todo add redis representation of this data
let spots = [];

const FindSpotById = async (spot_id) => {
    const spot = await Spot.findOne({'spot_id': spot_id});

    if (!spot) {
        return {error: 'No such spot', spot: null}
    }

    return {error: '', spot: spot}
};

const FindSpotByName = async (spot_name) => {
    const spot = await Spot.findOne({'spot_name': spot_name});

    if (!spot) {
        return {error: 'No such profile', spot: null}
    }

    return {error: '', spot: spot}
};

const LoadSavedSpots = async function () {
    const savedSpots = await Spot.find({});

    let promises = savedSpots.map(async spot => {
        const persistentSpot = {
            coordinates: spot.coordinates,
            spot_name: spot.spot_name,
            spot_id: spot.spot_id,
            description: spot.description,
            icon: spot.icon
        };

        // console.log(persistentSpot);

        return await AddSpotToPersistentMemory(persistentSpot);
    });

    return await Promise.all(promises)
        .then(spots => {
            // console.log('Saved persistent spots = ', spots);
            return spots;
        })
        .catch(err => {
            // console.log('Saved persistent spots error = ', err);
            throw err;
        });
};

const CreateNewSpot = async function ({description, icon, coordinates, reward}) {
    try {
        coordinates.latitude = coordinates.latitude.toString().replace('.', ',');
        coordinates.longitude = coordinates.longitude.toString().replace('.', ',');
        coordinates.altitude = coordinates.altitude.toString().replace('.', ',');

        const spot = new Spot({
            description,
            icon: icon ? icon : await sharp('tests/fixtures/default_map_icon.png').toBuffer(),
            coordinates,
            reward
        });

        const savedSpot = await spot.save(spot);
        const persistentSpot = {
            coordinates: savedSpot.coordinates,
            spot_name: savedSpot.spot_name,
            spot_id: savedSpot.spot_id,
            description: savedSpot.description,
            icon: savedSpot.icon
        };

        await AddSpotToPersistentMemory(persistentSpot);

        return {error: '', spot: persistentSpot};
    } catch (e) {
        return {error: e.message, spot: ''};
    }
};

const EnableDisableSpotBySpotId = async function ({spot_id, isEnable}) {
    try {
        const spot = await FindSpotById(spot_id);
        if (spot.error) {
            return {error: spot.error};
        }

        if (spot.isEnabled !== isEnable) {
            spot.isEnabled = isEnable;
            await spot.save(spot);
        }

        return {error: ''};
    } catch (e) {
        return {error: e.message};
    }
};

const DeleteSpotBySpotId = async function ({spot_id}) {
    try {
        const spot = await FindSpotById(spot_id);
        if (spot.error) {
            return {error: spot.error};
        }

        await spot.deleteOne(spot);

        return {error: ''};
    } catch (e) {
        return {error: e.message};
    }
};

const ChangeSpotIcon = async function ({spot_id, newIcon}) {
    try {
        const spot = await FindSpotById(spot_id);
        spot.icon = Buffer.from(newIcon);
        await spot.save(spot);

        return {error: ''};
    } catch (e) {
        return {error: e.message};
    }
};

const GetSpotIcon = async function (spot_id) {
    try {
        const spotIcon = await Spot.findOne({'spot_id': spot_id}).select('-_id icon');

        if (!spotIcon) {
            return {error: 'No such spot'};
        }
        return {error: '', icon: spotIcon};
    } catch (e) {
        return {error: e.message};
    }
};

const UpdateSpotData = async function ({spot_id, parametersToUpdate}) {
    const updates = Object.keys(parametersToUpdate);
    const allowedUpdates = ['coordinates, spot_name, description, reward'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return {error: 'Invalid updates!'};
    }

    const spot = await FindSpotById(spot_id);

    if (!spot) {
        return {error: 'No such spot'};
    }

    try {
        updates.forEach((update) => spot[update] = parametersToUpdate[update]);
        await spot.save(spot);
        return {error: ''};
    } catch (e) {
        console.log(e.message);
        return {error: e.message};
    }
};

const GetSpotData = async function (spot_id) {
    try {
        const spot = await FindSpotById(spot_id);
        if (!spot) {
            return {error: "No such spot"};
        }

        const spotProfile = await spot.getSpotGeneralInfo();
        return {error: "", spot: spotProfile};
    } catch (e) {
        return {error: e.message};
    }
};

const FindNearbySpots = async function ({centerCoordinates, radiusKilometers = 0.5}) {
    let spotsWithinRadius = [];
    console.log('spots = ', spots);

    for (let spot of spots) {
        const isWithinRadius = await withinRadius(centerCoordinates, spot.coordinates, radiusKilometers);
        if (isWithinRadius) {
            spotsWithinRadius.push(spot);
        }
    }

    async function withinRadius(point, interest, kms) {
        'use strict';
        let R = 6371;
        let deg2rad = async (n) => {
            return await Math.tan(n * (Math.PI / 180))
        };

        interest.latitude = interest.latitude.replace(',', '.');
        interest.longitude = interest.longitude.replace(',', '.');
        point.latitude = point.latitude.replace(',', '.');
        point.longitude = point.longitude.replace(',', '.');

        let dLat = await deg2rad(parseFloat(interest.latitude) - parseFloat(point.latitude));
        let dLon = await deg2rad(parseFloat(interest.longitude) - parseFloat(point.longitude));

        let a = await Math.sin(dLat / 2) * await Math.sin(dLat / 2) + await Math.cos(await deg2rad(point.latitude)) * await Math.cos(await deg2rad(interest.latitude)) * await Math.sin(dLon / 2) * await Math.sin(dLon / 2);
        let c = 2 * await Math.asin(await Math.sqrt(a));
        let d = R * c;

        return (d <= kms);
    }

    for (let spot of spotsWithinRadius) {

        delete spot.icon;
    }

    // console.log(centerCoordinates, radiusKilometers, spotsWithinRadius);
    return spotsWithinRadius;
};

const CollectSpot = async function ({spot_id, socketID}) {
    try {
        const spot = await FindSpotById(spot_id);
        if (!spot || spot.error) {
            return {error: spot.error};
        }

        if (!spot.spot.isEnabled) {
            return {error: 'Inactive spot'};
        }

        const user = await Users.FindUserBySocketId(socketID);
        if (!user || user.error) {
            return {error: user.error};
        }

        const collectOnSpot = await spot.spot.collectSpot(user.user._id);
        const collectForUser = await user.user.collectSpot(spot.spot);

        if (!collectOnSpot || !collectForUser) {
            return {error: 'Error collecting spot'}
        }

        //todo check last user coordinates to be sure that he is near the spot

        return {error: '', reward: collectForUser}
    } catch (e) {
        console.log(e);
        return {error: e.message}
    }
};

const GetSpotCollectionHistory = async function (spot_id, records = 20) {
    try {
        let spot;
        if (records === 0) {
            spot = await UserProfile.findOne({'spot_id': spot_id}).select('-_id collections_history').populate('collections_history.user_id').exec();
        } else {
            spot = await UserProfile.findOne({'spot_id': spot_id}).limit(records).select('-_id collections_history').populate('collections_history.user_id').exec();
        }

        if (!spot) {
            return {error: "No such spot"};
        }

        return {error: "", history: spot};
    } catch (e) {
        return {error: e.message};
    }
};

//spots persistent methods
//todo add redis representation of this data

const AddSpotToPersistentMemory = async function (spot) {
    // console.log('added spot = ', spot);

    let persistentSpot = await spots.includes(spot);
    if (persistentSpot) {
        return spot;
    }

    await spots.push(spot);
    return spot;
};

const DeleteSpotFromPersistentMemory = async function (spot_id) {
    let persistentSpot = await spots.includes(spot => spot.spot_id === spot_id);
    if (!persistentSpot) {
        return persistentSpot;
    }

    spots = await spots.filter(spot => spot.spot_id !== persistentSpot.spot_id);
    // console.log(spots);
};

const UpdateSpotCoordinatesInPersistentMemory = async function (spot_id, coordinates) {
    let persistentSpot = await spots.includes(spot => spot.spot_id === spot_id);
    if (!persistentSpot) {
        return persistentSpot;
    }

    await DeleteSpotFromPersistentMemory(spot_id);

    persistentSpot.coordinates = coordinates;
    await spots.push(persistentSpot);

    // console.log(spots);
};

const UpdateSpotNameInPersistentMemory = async function (spot_id, spot_name) {
    let persistentSpot = await spots.includes(spot => spot.spot_id === spot_id);
    if (!persistentSpot) {
        return persistentSpot;
    }

    await DeleteSpotFromPersistentMemory(spot_id);

    persistentSpot.spot_name = spot_name;
    await spots.push(persistentSpot);

    // console.log(spots);
};

const UpdateSpotDescriptionInPersistentMemory = async function (spot_id, description) {
    let persistentSpot = await spots.includes(spot => spot.spot_id === spot_id);
    if (!persistentSpot) {
        return persistentSpot;
    }

    await DeleteSpotFromPersistentMemory(spot_id);

    persistentSpot.description = description;
    await spots.push(persistentSpot);

    // console.log(spots);
};

LoadSavedSpots();

exports = module.exports = {
    GetSpotIcon,
    ChangeSpotIcon,
    CreateNewSpot,
    EnableDisableSpotBySpotId,
    DeleteSpotBySpotId,
    GetSpotCollectionHistory,
    FindNearbySpots,
    CollectSpot,
    GetSpotData,
    UpdateSpotData
};