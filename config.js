var mysql = require('mysql');
var paypal = require('paypal-rest-sdk');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'friend.b617',
    database: 'corrlinks'
});
module.exports.connection = connection;

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AVrTY9IbOorMiALM0KXOlNd9TN6T5RyZjowCqRu9yQ92cWZxDRt_kYXX-FpXs-W5ACPn7lRaGY4nc37Z',
    'client_secret': 'ENEa0ol2_LjtwO44aio95TXf8H5ys2TbXcHFRKHHaEnOMIXk5Wt6QQDkZtNI4ywPtxGxCQhYbf8ANU6j'
});