const mongoose = require('mongoose')

const payments = mongoose.Schema({
    id: Number,
    order_id: Number,
    transaction_id: String,
    date: Date
});

module.exports = mongoose.model('payments', payments);