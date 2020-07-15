const spotsController = require('../controllers/spots_controller');
const usersController = require('../controllers/users_controller');

function GameplayEvents({io, socket}) {
    this.io = io;
    this.socket = socket;
    return this;
}

const {
    CheckIfTokenIsValid
} = require('../utils/auth');

GameplayEvents.prototype.Listen = async function () {
    const thisEvents = this;

    thisEvents.socket.on('test-event-2', async (userParameters, callback) => {
        callback('Test event received')
    });

    thisEvents.socket.on('AddSpot', async ({description, coordinates, reward}, callback) => {
        try {
            const newSpot = await spotsController.CreateNewSpot({
                description,
                coordinates,
                reward
            });
            console.log(`Client ${thisEvents.socket.id} just created spot`);
            return callback({error: '', spot: newSpot});
        } catch (e) {
            console.log(e);
            return callback({error: e});
        }
    });

    thisEvents.socket.on('Update_Nearby_Spots_Info', async ({access_token, coordinates}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const nearbySpots = await spotsController.FindNearbySpots({
                            centerCoordinates: coordinates,
                            radiusKilometers: 0.5
                        });
                        console.log(`Client ${thisEvents.socket.id} just checked coordinates`);
                        return callback({error: '', spots_list: nearbySpots});

                    } catch (e) {
                        return callback({error: e.message, spots_list: []});
                    }
                }
            }
        });
    });

    thisEvents.socket.on('Collect_Spot', async ({access_token, spot_id}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const collectionResult = await spotsController.CollectSpot({
                            socketID: thisEvents.socket.id,
                            spot_id: spot_id
                        });
                        console.log(`Client ${thisEvents.socket.id} just collected spot with id ${spot_id}`);
                        return callback({error: '', reward: collectionResult.reward});

                    } catch (e) {
                        return callback({error: e.message, reward: {}});
                    }
                }
            }
        });
    });

    thisEvents.socket.on('Get_Spot_Info', async ({access_token, spot_id}, callback) => {
        //"{error:"""",
        // spot:[{
        // type:""(xxxx)"",
        // reward:xxxx,
        // status:""(collected|unvisited|restricted)"",
        // coordinates:{latitude:""xxxx"", longitude:""xxxx"", altitude:""xxxx""}
        // }]}"
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const spotData = await spotsController.GetSpotData(spot_id);
                        console.log(`Client ${thisEvents.socket.id} just requested spot data with id ${spot_id}`);
                        return callback({error: '', spot: spotData});

                    } catch (e) {
                        return callback({error: e.message, spot: {}});
                    }
                }
            }
        });
    });

    thisEvents.socket.on('Get_Spot_Icon', async ({access_token, spot_id}, callback) => {
        CheckIfTokenIsValid({
            access_token: access_token,
            callback: async (result) => {
                if (!result.error) {
                    try {
                        const icon = await spotsController.GetSpotIcon(spot_id);
                        console.log(`Client ${thisEvents.socket.id} just requested spot icon with id ${spot_id}`);
                        return callback({error: '', icon: icon.icon, spot_id});
                    } catch (e) {
                        return callback({error: e.message, icon: null, spot_id});
                    }
                }
            }
        });
    });
};

exports = module.exports = GameplayEvents;