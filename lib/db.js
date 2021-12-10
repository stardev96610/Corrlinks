var config = require('../config');

config.connection.connect(function(error) {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Connected..!');
    }
});

module.exports = config.connection;