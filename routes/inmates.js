var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
// display inmates page
router.get('/', async function(req, res, next) {

    dbConn.query('SELECT * FROM inmates', function(err, rows) {

        if (err) {
            req.flash('error', err);
            // render to views/inmates/index.ejs
            res.render('inmates', { data: '' });
        } else {
            // render to views/inmates/index.ejs
            res.render('inmates', { data: rows });
        }
    });
});

// display add inmate page
router.get('/add', function(req, res, next) {
    // render to add.ejs
    res.render('inmates/add', {
        name: '',
        number: '',
        phone_number: ''
    })
})

// add a new inmate
router.post('/add', function(req, res, next) {

    let name = req.body.name;
    let number = req.body.number;
    let phone_number = req.body.phone_number;
    let errors = false;

    if (name.length === 0 || number.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and number");
        // render to add.ejs with flash message
        res.render('inmates/add', {
            name: name,
            number: number,
            phone_number: phone_number
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            name: name,
            number: number,
            phone_number: phone_number
        }

        // insert query
        dbConn.query('INSERT INTO inmates SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('inmates/add', {
                    name: form_data.name,
                    number: form_data.number,
                    phone_number: phone_number
                })
            } else {
                req.flash('success', 'Inmate successfully added');
                res.redirect('/inmates');
            }
        })
    }
})

// display edit inmate page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM inmates WHERE id = ' + id, function(err, rows, fields) {
        if (err) throw err

        // if inmate not found
        if (rows.length <= 0) {
            req.flash('error', 'Inmate not found with id = ' + id)
            res.redirect('/inmates')
        }
        // if inmate found
        else {
            // render to edit.ejs
            res.render('inmates/edit', {
                title: 'Edit Inmate',
                id: rows[0].id,
                name: rows[0].name,
                number: rows[0].number,
                phone_number: rows[0].phone_number
            })
        }
    })
})

// update inmate data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let name = req.body.name;
    let number = req.body.number;
    let phone_number = req.body.phone_number;
    let errors = false;

    if (name.length === 0 || number.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and number");
        // render to add.ejs with flash message
        res.render('inmates/edit', {
            id: req.params.id,
            name: name,
            number: number,
            phone_number: phone_number,
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
                name: name,
                number: number,
                phone_number: phone_number,
            }
            // update query
        dbConn.query('UPDATE inmates SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                    // render to edit.ejs
                res.render('inmates/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    number: form_data.number,
                    phone_number: phone_number
                })
            } else {
                req.flash('success', 'Inmate successfully updated');
                res.redirect('/inmates');
            }
        })
    }
})

// delete inmate
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM inmates WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
                // redirect to inmates page
            res.redirect('/inmates')
        } else {
            // set flash message
            req.flash('success', 'Inmate successfully deleted!')
                // redirect to inmates page
            res.redirect('/inmates')
        }
    })
})

module.exports = router;