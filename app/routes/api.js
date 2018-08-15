var User = require('../models/user'); 
var jwt = require('jsonwebtoken');
var secret = 'harrypotter'; 
module.exports = function(router) {
    // Route to register new users  
    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username; 
        user.password = req.body.password;
        user.name = req.body.name;
        user.isAdmin = req.body.isAdmin;
    
           console.log(user)
        // Check if request is valid and not empty or null
        if (req.body.username === null || req.body.username === '' || req.body.password === null || req.body.password === '' || req.body.email === null || req.body.email === '' || req.body.name === null || req.body.name === '') {
            res.json({ success: false, message: 'Ensure username, and password were provided' });
        } else {
            // Save new user to database
            user.save(function(err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.name) {
                            res.json({ success: false, message: err.errors.name.message }); // Display error in validation (name)
                        } else if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message }); // Display error in validation (username)
                        } else if (err.errors.password) {
                            res.json({ success: false, message: err.errors.password.message }); // Display error in validation (password)
                        } else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
                            } 
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                    res.json({ success: true, message: 'Account registered!' }); // Send success message back to controller/request
                }
            });
        }
    });

    // Route for user logins
    router.post('/authenticate', function(req, res) {
        var loginUser = (req.body.username).toLowerCase(); // Ensure username is checked in lowercase against database
        User.findOne({ username: loginUser }).select('email username password isAdmin').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if user is found in the database (based on username)           
                if (!user) {
                    res.json({ success: false, message: 'Username not found' }); // Username not found in database
                } else if (user) {
                    // Check if user does exist, then compare password provided by user
                    if (!req.body.password) {
                        res.json({ success: false, message: 'No password provided' }); // Password was not provided
                    } else {
                        var validPassword = user.comparePassword(req.body.password); // Check if password matches password provided by user 
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
                        } else {
                            console.log(user)
                            var token = jwt.sign({ username: user.username, email: user.email, isAdmin: user.isAdmin  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                            res.json({ success: true, message: 'User authenticated!', token: token, isAdmin: user.isAdmin }); // Return token in JSON object to controller
                        }
                    }
                }
            }
        });
    });


    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

        // Check if token is valid and not expired  
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
        }
    });

    router.get('/users', function(req, res) {
        User.find({}).select('email username name password isAdmin').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                console.log(user)
                res.send(user)
            }
        })

    })

    router.put('/user', function(req,res){
        console.log(req.body)
        User.update (
            { _id : req.body.userid },
            { $set : { name:req.body.name, username:req.body.username} },
            function( err, result ) {
                if ( err ) throw err;
                res.send(result)
            }
        );
    })
    router.get('/user/:user_id', function(req, res) {
        User.findOne({ _id: req.params.user_id}).select('username name password isAdmin').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                console.log(user)
                res.send(user)
            }
        })

    })


    router.delete('/user/:user_id', function(req,res){
        User.remove({
            _id: req.params.user_id
        }, function (err, user) {
            if (err) return res.send(err);
            res.json({ message: 'Deleted' });
        });
    })
    // Route to get the currently logged in user    
    router.post('/me', function(req, res) {
        console.log(req.decoded)
        res.send(req.decoded); // Return the token acquired from middleware
    });

    return router; // Return the router object to server
};
