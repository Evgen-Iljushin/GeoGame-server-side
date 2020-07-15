const admin = require('firebase-admin');
const serviceAccount = require(`../../${process.env.FIREBASE_APP_KEY}`); // json ключ доступу до firebase проекту

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_APP_URL
});



const testPush = async({socketID, callback})=>{
    try{
        console.log(app)
        return callback(app.name)
    } catch (e) {
        return callback({error: e})
    }

}


const testSendMessage = async () =>{
    var registrationToken = 'xtqwEHZDDuVU5zc9CIYAcm91qq22';

    var message = {
        data: {
            score: '850',
            time: '2:45'
        },
        token: registrationToken
    };

// Send a message to the device corresponding to the provided
// registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}


var defaultAuth = app.auth();
var defaultDatabase = app.database();


exports = module.exports = {
    testPush
};
