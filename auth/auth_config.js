// config/auth.js
var port = process.env.PORT || 80;

// expose our config directly to our application using module.exports
module.exports = {
    'facebookAuth' : {
        'clientID'      : '1724484991112261', // your App ID
        'clientSecret'  : '71df00d089a83c6296b294fb29e5c6d1', // your App Secret
        'callbackURL'   : 'http://ateji.jp/auth/facebook/callback'
    },
    'twitterAuth' : {
        'consumerKey'       : 'IFHcdoMwqc5wcN06JnEec4nXL',
        'consumerSecret'    : 'mdr1cQ7ijtRp4fPun3JYUjIL4Qhg2GIEcRkLfQeLmGu79OQNvg',
        'callbackURL'       : 'http://minlette-ubuntu.cloudapp/twitter/callback'
    },
    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }
};
