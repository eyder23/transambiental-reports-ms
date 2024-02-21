var firebase = require('firebase-admin');

var serviceAccount = require('./runcode-reports-transambiental-firebase-adminsdk-5zqmo-f53e524682.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

module.exports = firebase;
