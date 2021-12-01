var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
router.post('/', function(req, res, next) {
    if (req.body.email == "keelan417@gmail.com" && req.body.password == "Aa187187") {
        res.redirect('/inmates');
    } else {
        res.redirect('/');
    }
});
module.exports = router;