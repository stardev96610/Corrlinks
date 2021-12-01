var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// display keywords page
router.get('/', function(req, res, next) {

    dbConn.query('SELECT * FROM keywords ORDER BY id desc', function(err, rows) {
        if (err) {
            req.flash('error', err);
            // render to views/keywords/index.ejs
            res.render('keywords', { data: '' });
        } else {
            // render to views/keywords/index.ejs
            res.render('keywords', { data: rows });
        }
    });
});

// display add keyword page
router.get('/add', function(req, res, next) {
    // render to add.ejs
    res.render('keywords/add', {
        keyword: '',
        content: '',
    })
})

// add a new keyword
router.post('/add', function(req, res, next) {

    let keyword = req.body.keyword;
    let content = req.body.content;
    let errors = false;

    if (keyword.length === 0 || content.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter keyword and content");
        // render to add.ejs with flash message
        res.render('keywords/add', {
            keyword: keyword,
            content: content,
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            keyword: keyword,
            content: content,
        }

        // insert query
        dbConn.query('INSERT INTO keywords SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('keywords/add', {
                    keyword: form_data.keyword,
                    content: form_data.content,
                })
            } else {
                req.flash('success', 'Keyword successfully added');
                res.redirect('/keywords');
            }
        })
    }
})

// display edit keyword page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM keywords WHERE id = ' + id, function(err, rows, fields) {
        if (err) throw err

        // if keyword not found
        if (rows.length <= 0) {
            req.flash('error', 'Keyword not found with id = ' + id)
            res.redirect('/keywords')
        }
        // if keyword found
        else {
            // render to edit.ejs
            res.render('keywords/edit', {
                title: 'Edit Keyword',
                id: rows[0].id,
                keyword: rows[0].keyword,
                content: rows[0].content,
            })
        }
    })
})

// update keyword data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let keyword = req.body.keyword;
    let content = req.body.content;
    let errors = false;

    if (keyword.length === 0 || content.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter keyword and content");
        // render to add.ejs with flash message
        res.render('keywords/edit', {
            id: req.params.id,
            keyword: keyword,
            content: content,
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
                keyword: keyword,
                content: content,
            }
            // update query
        dbConn.query('UPDATE keywords SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                    // render to edit.ejs
                res.render('keywords/edit', {
                    id: req.params.id,
                    keyword: form_data.keyword,
                    content: form_data.content,
                })
            } else {
                req.flash('success', 'Keyword successfully updated');
                res.redirect('/keywords');
            }
        })
    }
})

// delete keyword
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM keywords WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
                // redirect to keywords page
            res.redirect('/keywords')
        } else {
            // set flash message
            req.flash('success', 'Keyword successfully deleted!')
                // redirect to keywords page
            res.redirect('/keywords')
        }
    })
})

module.exports = router;