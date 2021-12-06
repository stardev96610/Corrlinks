var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AVrTY9IbOorMiALM0KXOlNd9TN6T5RyZjowCqRu9yQ92cWZxDRt_kYXX-FpXs-W5ACPn7lRaGY4nc37Z',
    'client_secret': 'ENEa0ol2_LjtwO44aio95TXf8H5ys2TbXcHFRKHHaEnOMIXk5Wt6QQDkZtNI4ywPtxGxCQhYbf8ANU6j'
});
// display keywords page
router.get('/', function(req, res, next) {
    dbConn.query('SELECT * FROM inmates ORDER BY id desc', function(err, rows) {

        if (err) {
            req.flash('error', err);
            // render to views/inmates/index.ejs
            res.render('payment', { data: '' });
        } else {
            // render to views/inmates/index.ejs
            res.render('payment', { data: rows });
        }
    });
});

// display buy page
router.get('/buy', function(req, res, next) {
    // create payment object 
    console.log(req.query)
    let { inmateNumber, amount } = req.query;
    var payment = {
            "intent": "authorize",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://127.0.0.1:4000/payment/success",
                "cancel_url": "http://127.0.0.1:4000/payment/err"
            },
            "transactions": [{
                "amount": {
                    "total": amount,
                    "currency": "USD"
                },
                "description": " a book on mean stack "
            }]
        }
        // call the create Pay method 
    createPay(payment)
        .then((transaction) => {
            var id = transaction.id;
            var links = transaction.links;
            var counter = links.length;
            while (counter--) {
                if (links[counter].method == 'REDIRECT') {
                    // redirect to paypal where user approves the transaction 
                    console.log(links[counter].href)
                    return res.redirect(links[counter].href)
                }
            }
        })
        .catch((err) => {
            console.log(err);
            res.render('payment/err');
        });
})

// success page 
router.get('/payment/success', (req, res) => {
    console.log(req.query);
    res.render('payment/success');
})

// error page 
router.get('payment/err', (req, res) => {
    console.log(req.query);
    res.render('payment/err');
})

// helper functions 
var createPay = (payment) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, function(err, payment) {
            if (err) {
                reject(err);
            } else {
                resolve(payment);
            }
        });
    });
}

module.exports = router;