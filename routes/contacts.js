var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// display contacts page
router.get('/', function(req, res, next) {
    // let inmateId = 4;
    dbConn.query(`SELECT * FROM inmates`, (error, inmates) => {
        let inmateId = req.query.inmateId || inmates[0].id;
        console.log(inmateId)
        if (inmates.length) {
            dbConn.query(`SELECT * FROM contacts WHERE inmate_id=${inmateId}`, function(err, rows) {
                if (err) {
                    req.flash('error', err);
                    // render to views/contacts/index.ejs
                    res.render('contacts', { data: '', inmates: '' });
                } else {
                    // render to views/contacts/index.ejs
                    res.render('contacts', { data: rows, inmates, inmateId });
                }
            });
        }
    })
});

// display add contact page
router.get('/add', function(req, res, next) {
    // render to add.ejs
    let inmateId = req.query.inmateId;
    console.log(inmateId);
    if (inmateId) {
        dbConn.query(`SELECT * FROM inmates WHERE id=${inmateId}`, (error, inmate) => {
            console.log(error)
            if (inmate.length) {
                var number = inmate[0].number;
            } else {
                var number = ''
            }
            res.render('contacts/add', {
                number,
                contact_name: '',
                contact_number: '',
            });
        })
    } else {
        res.render('contacts/add', {
            number: '',
            contact_name: '',
            contact_number: '',
        });
    }
})

// add a new contact
router.post('/add', function(req, res, next) {

    let number = req.body.number;
    let contact_name = req.body.contact_name;
    let contact_number = req.body.contact_number;
    let errors = false;

    if (contact_name.length === 0 || contact_number.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter Name and Number");
        // render to add.ejs with flash message
        res.render('contacts/add', {
            number: number,
            contact_name: contact_name,
            contact_number: contact_number
        })
    }

    // if no error
    if (!errors) {
        dbConn.query(`SELECT * from inmates WHERE number=${number}`, (error, inmate) => {
            if (inmate.length) {
                var form_data = {
                    inmate_id: inmate[0].id,
                    contact_name: contact_name,
                    contact_number: contact_number,
                }
                dbConn.query('INSERT INTO contacts SET ?', form_data, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)

                        // render to add.ejs
                        res.render('contacts/add', {
                            number,
                            contact_name,
                            contact_number
                        })
                    } else {
                        req.flash('success', 'Contact successfully added');
                        res.redirect(`/contacts?inmateId=${inmate[0].id}`);
                    }
                })
            }
        })

        // insert query

    }
})

// display edit contact page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM contacts WHERE id = ' + id, function(err, rows, fields) {
        if (err) throw err

        // if contact not found
        if (rows.length <= 0) {
            req.flash('error', 'Contact not found with id = ' + id)
            res.redirect('/contacts')
        }
        // if contact found
        else {
            // render to edit.ejs
            res.render('contacts/edit', {
                title: 'Edit Contact',
                id: rows[0].id,
                contact_name: rows[0].contact_name,
                contact_number: rows[0].contact_number,
            })
        }
    })
})

// update contact data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let contact_name = req.body.contact_name;
    let contact_number = req.body.contact_number;
    let errors = false;

    if (contact_name.length === 0 || contact_number.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter contact and content");
        // render to add.ejs with flash message
        res.render('contacts/edit', {
            id: req.params.id,
            contact_name,
            contact_number,
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
                contact_name,
                contact_number,
            }
            // update query
        dbConn.query('UPDATE contacts SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                    // render to edit.ejs
                res.render('contacts/edit', {
                    id: req.params.id,
                    contact_name,
                    contact_number,
                })
            } else {
                dbConn.query(`SELECT * FROM contacts WHERE id=${id}`, (err, item) => {
                    if (item.length) {
                        req.flash('success', 'Contact successfully updated');
                        res.redirect(`/contacts?inmateId=${item[0].inmate_id}`);
                    } else {
                        req.flash('error', err)
                            // render to edit.ejs
                        res.render('contacts/edit', {
                            id: req.params.id,
                            contact_name,
                            contact_number,
                        })
                    }
                })
            }
        })
    }
})

// delete contact
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
    dbConn.query(`SELECT * FROM contacts WHERE id=${id}`, (err, item) => {
        if (item.length) {
            dbConn.query('DELETE FROM contacts WHERE id = ' + id, function(err, result) {
                //if(err) throw err
                if (err) {
                    // set flash message
                    req.flash('error', err)
                        // redirect to contacts page
                    res.redirect('/contacts')
                } else {
                    req.flash('success', 'Contact successfully deleted');
                    res.redirect(`/contacts?inmateId=${item[0].inmate_id}`);
                }
            });
        } else {
            res.redirect(`/contacts`);
        }
    })
})

module.exports = router;