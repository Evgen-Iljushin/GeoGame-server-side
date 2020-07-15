const app = require('./app');
const PORT = process.env.PORT || 3000;
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

const RegistrationAndAuthEvents = require('./events/registration_and_auth_events');
const GameplayEvents = require('./events/gameplay_events');
const ProfileEvents = require('./events/profile_events');
const PushEvents = require('./events/push_events');

io.on('connect', async (socket) => {
    console.log(`Client ${socket.id} just connected`);

    let registrationAndAuthEventsListener = new RegistrationAndAuthEvents({io, socket});
    await registrationAndAuthEventsListener.Listen();

    let gameplayEventsListener = new GameplayEvents({io, socket});
    await gameplayEventsListener.Listen();

    let profileEventsListener = new ProfileEvents({io, socket});
    await profileEventsListener.Listen();

    let PushEventsListener = new PushEvents({io, socket});
    await PushEventsListener.Listen();

    socket.on('disconnect', async () => {
        try {
        } catch (e) {
        }
        console.log(`Client ${socket.id} just disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

exports = module.exports = {
    io
};
