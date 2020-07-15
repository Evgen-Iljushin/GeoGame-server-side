const socket = io();

const $send_test_eventButton = document.querySelector("#send_test_event");

const $Registration_Username = document.querySelector("#Registration_Username");
const $Registration_FB = document.querySelector("#Registration_FB");
const $Login_Username = document.querySelector("#Login_Username");
const $Login_FB = document.querySelector("#Login_FB");
const $Authenticate = document.querySelector("#Authenticate");

const $AddSpot = document.querySelector("#AddSpot");
const $AddSpotLatitude = document.querySelector("#lat");
const $AddSpotLongitude = document.querySelector("#lon");
const $AddSpotAltitude = document.querySelector("#alt");
const $CheckNearbySpots = document.querySelector("#CheckNearbySpots");
const $CollectSpot = document.querySelector("#CollectSpot");
const $GetSpotIcon = document.querySelector("#GetSpotIcon");

const $Get_Profile = document.querySelector("#Get_Profile");
const $Update_Profile = document.querySelector("#Update_Profile");
const $Get_Profile_Image = document.querySelector("#Get_Profile_Image");
const $Update_Profile_Image = document.querySelector("#Update_Profile_Image");
const $Test_Connection_Firebase = document.querySelector("#Test_Connection_Firebase");

let token = '';

const phoneOne = "+38 063 960 55 32";
const phoneTwo = "+38 063 960 55 30";
const phoneThree = "+38 063 960 55 31";

const passwordOne = "qWeR7Y!!";
const passwordTwo = "!A!s7D1f!";

const firstNameOne = 'Vasily';
const lastNameOne = 'Pupkin';
const usernameOne = 'CoolHacker9000';
const emailOne = 'testmail@mail.com';
const genderOne = 'Male';

let tokenFB = 'EAAHdOxE0EDIBAJJnAwpAJ4kyZAIXok9uOHGcqflB07JtZBwCqPupuSnGM1kqw2N5CZC4ThJ0efgIEaI82bYdC65aTKHETO51Bzy2dRhk0KufVUHEB7KMntgdOhzneRbAgLhkPGEiRogzyHJXr91yB0fv3DXMJtYz6AKolJ3LZBqZCHUvsyzMf';

$send_test_eventButton.addEventListener('click', () => {
    socket.emit('test-event', {phone: "+86 139 1099 8888"}, (result) => {
        console.log(result);
    });
});

$Registration_Username.addEventListener('click', () => {
    socket.emit('Registration_Username', {
        username: usernameOne,
        email: emailOne,
        password: passwordOne,
        gender: genderOne
    }, (result) => {
        token = result.access_token;
        console.log(result);
    });
});

$Login_Username.addEventListener('click', () => {
    socket.emit('Login_Username', {username: usernameOne, password: passwordOne}, (result) => {
        token = result.access_token;
        console.log(result);
    });
});

$Registration_FB.addEventListener('click', () => {
    console.log('token ', tokenFB)
    socket.emit('Registration_FB', {fb_verification_token: tokenFB}, (result) => {
        console.log(result);
    });
});

$Login_FB.addEventListener('click', () => {
    console.log('tokenFB ', tokenFB)
    socket.emit('Login_FB', {fb_verification_token: tokenFB}, (result) => {
        console.log(result);
    });
});

$Authenticate.addEventListener('click', () => {
    socket.emit('Authenticate', {access_token: token}, (result) => {
        token = result.access_token;
        console.log(result);
    });
});
//,
$AddSpot.addEventListener('click', () => {
    socket.emit('AddSpot', {
        description: 'test spot',
        coordinates: {
            latitude: $AddSpotLatitude.value,
            longitude: $AddSpotLongitude.value,
            altitude: $AddSpotAltitude.value
        },
        reward: {reward_type: 'money', reward_amount: 50}
    }, (result) => {
        console.log(result);
    });
});

$CheckNearbySpots.addEventListener('click', () => {
    socket.emit('Update_Nearby_Spots_Info', {
        access_token: token,
        coordinates: {latitude: '49,442506', longitude: '32,061914', altitude: '0'}
        // coordinates: {latitude: '49,428840637207', longitude: '32,0855712890625', altitude: 0}
    }, (result) => {
        console.log(result);
    });
});

$CollectSpot.addEventListener('click', () => {
    socket.emit('Collect_Spot', {
        access_token: token,
        spot_id: 'd5cb630d3cfda6c5c66a94c324f1228c9733ccd89e204553231a4d22bc3d280f'
    }, (result) => {
        console.log(result);
    });
});

$GetSpotIcon.addEventListener('click', () => {
    socket.emit('Get_Spot_Icon', {
        access_token: token,
        spot_id: 'd5cb630d3cfda6c5c66a94c324f1228c9733ccd89e204553231a4d22bc3d280f'
    }, (result) => {
        console.log(result);
    });
});

$Get_Profile.addEventListener('click', () => {
    socket.emit('Get_Profile', {
        access_token: token,
        profileOwnerSocketID: socket.id
    }, (result) => {
        console.log(result);
    });
});

$Update_Profile.addEventListener('click', () => {
    socket.emit('Update_Profile', {
        access_token: token,
        updates: {'firstName': 'Vasya', 'lastName': 'Pupkin'}
    }, (result) => {
        console.log(result);
    });
});

$Get_Profile_Image.addEventListener('click', () => {
    socket.emit('Get_Profile_Image', {
        access_token: token,
        avatarOwnerSocketId: socket.id
    }, (result) => {
        console.log(result);
    });
});

$Update_Profile_Image.addEventListener('click', () => {
    socket.emit('Update_Profile_Image', {
        access_token: token,
        newImage: 'tester'
    }, (result) => {
        console.log(result);
    });
});

$Test_Connection_Firebase.addEventListener('click', () => {
    socket.emit('test-firebase', {
        access_token: token
    }, (result) => {
        console.log(result);
    });
});

socket.on('Test out event', (hashData) => {
    console.log(hashData);
});
