var mongoose = require('mongoose'); 
var Schema = mongoose.Schema; 
var bcrypt = require('bcrypt-nodejs');
// User Mongoose Schema
var UserSchema = new Schema({
    name: { type: String, required: true},
    username: { type: String, lowercase: true, required: true, unique: true},
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean }
});

// Middleware to ensure password is encrypted before saving user to database
UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next(); 

    // Function to encrypt password 
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err); 
        user.password = hash; 
        next();
    });
});


// Method to compare passwords in API (when user logs in) 
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password); // Returns true if password matches, false if doesn't
};

module.exports = mongoose.model('User', UserSchema); // Export User Model for us in API
