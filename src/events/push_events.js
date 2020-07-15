function PushEvents({io, socket}) {
    this.io = io;
    this.socket = socket;
    return this;
}

const {
    testPush
} = require('../utils/push');

PushEvents.prototype.Listen = async function () {
    const thisEvents = this;

    thisEvents.socket.on('test-firebase', async (userParameters, callback) => {
        await testPush({
            socketID: thisEvents.socket.id,
            callback: async (result) => {

                if (!result.error) {
                    return callback(result);
                } else {
                    return callback({error: result.error});
                }
            }
        })
    });


}


exports = module.exports = PushEvents;
