var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
var paypal = require('paypal-rest-sdk');
var payInmateNumber;
var payAmount;
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
        let { inmateNumber, amount } = req.query;
        payInmateNumber = inmateNumber;
        payAmount = amount;
        let count = amount / 10;
        var payment = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://cloudcorr.com/payment/success",
                    "cancel_url": "http://cloudcorr.com/payment/err"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "month(s) approval for CloudCorr",
                            "price": "10.00",
                            "currency": "USD",
                            "quantity": count
                        }]
                    },
                    "amount": {
                        "total": amount,
                        "currency": "USD"
                    },
                    "description": "Washing Bar soap"
                }]
            }
            // call the create Pay method 
        paypal.payment.create(payment, function(error, payment) {
            if (error) {
                payInmateNumber = '';
                payAmount = '';
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        console.log('-------------');
                        console.log(payment.links[i].href);
                        console.log('-------------');
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
        // createPay(payment)
        //     .then((transaction) => {
        //         var id = transaction.id;
        //         var links = transaction.links;
        //         var counter = links.length;
        //         console.log(transaction);
        //         while (counter--) {
        //             if (links[counter].method == 'REDIRECT') {
        //                 // redirect to paypal where user approves the transaction 
        //                 console.log(links[counter].href)
        //                 return res.redirect(links[counter].href)
        //             }
        //         }
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //         res.render('payment/err');
        //     });
    })
    // success page 
router.get('/success', (req, res) => {
    let count = payAmount / 10;
    console.log(count)
    console.log(payInmateNumber);
    dbConn.query(`SELECT approved_until FROM inmates WHERE number=${payInmateNumber}`, (error, item) => {
        if (error) {
            console.log(error);
        } else {
            console.log(item[0].approved_until);
            let approveDate = item[0].approved_until || new Date();
            approveDate = new Date(approveDate);
            console.log(approveDate);
            approveDate.setMonth(approveDate.getMonth() + count);
            console.log(approveDate)
            let data = {
                approved_until: approveDate
            }
            approveDate = approveDate.toLocaleDateString()
            dbConn.query(`UPDATE inmates SET ? WHERE number=${payInmateNumber}`, data, (error, item) => {
                if (error) {
                    console.log(error);
                } else {
                    // console.log(item);
                    const payerId = req.query.PayerID;
                    const paymentId = req.query.paymentId;

                    const execute_payment_json = {
                        "payer_id": payerId,

                    };
                    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
                        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
                        if (error) {
                            console.log(error.response);
                            payInmateNumber = '';
                            payAmount = '';
                            throw error;
                        } else {
                            console.log(JSON.stringify(payment));
                            res.send('Success');
                            // res.render('payment/success', { payInmateNumber, payAmount });
                            // res.render('payment/success', { payInmateNumber, payAmount, approveDate });
                        }
                    });
                }
            })
        }
    });



    // console.log(req.query);

})

// error page 
router.get('/err', (req, res) => {
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