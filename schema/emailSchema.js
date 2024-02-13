const mongoose = require('mongoose')

const emails = mongoose.Schema({
    email: String,
    date: Date,
});

module.exports = mongoose.model('emails', emails);