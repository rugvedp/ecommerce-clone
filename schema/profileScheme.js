const mongoose = require('mongoose')

const userProfile = mongoose.Schema({
    name: String,
    info: String,
    Date: Date,
});
module.exports = mongoose.model('Profile', userProfile, 'profile');