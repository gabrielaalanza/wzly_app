var express = require('express');
var router = express.Router();

/*


// GET home page. 
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// GET helloworld page.
router.get('/helloworld', function(req, res) {
  res.render('helloworld', { title: 'Hello, world!' });
});

// GET Userlist page.
router.get('/djlist', function(req, res) {
    var db = req.db;
    var collection = db.get('djcollection');
    collection.find({},{},function(e,docs){
        res.render('djlist', {
            "djlist" : docs
        });
    });
});

// GET New User page. 
router.get('/newdj', function(req, res) {
    res.render('newdj', { title: 'Add New DJ' });
});

// POST to Add User Service 
router.post('/adddj', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.name;
    var userUsername = req.body.username;

    // Set our collection
    var collection = db.get('djcollection');

    // Submit to the DB
    collection.insert({
        "name" : userName,
        "username" : userUsername
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("djlist");
            // And forward to success page
            res.redirect("djlist");
        }
    });
});


*/

/*********** REAL STUFF ************/


/*


//render pages

router.get('/admin', function(req, res) {
    res.render('admin-interface', {title: 'Login to Interface'});
});

router.get('/log', function(req, res) {
    res.render('user-interface', {title: 'Login to Interface'});
}); 


*/

//module.exports = function(app, passport) {


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    router.get('/login', function(req, res) {
        res.render('login', {title: 'Login to Interface'});
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);


    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)


    router.get('/admin', isLoggedIn, function(req, res) {
        res.render('admin-interface', {
            title: 'Login to Interface',
            user : req.user // get the user out of session and pass to template
        });
    });

    router.get('/log', isLoggedIn, function(req, res) {
        res.render('user-interface', {
            title: 'Login to Interface',
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
//};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
