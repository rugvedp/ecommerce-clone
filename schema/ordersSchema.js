const mongoose = require('mongoose')

const orders = mongoose.Schema({
    id: Number,
    cost: Number,
    name: String,
    email: String,
    status: String,
    city: String,
    address: String,
    phone_number: String,
    date: Date,
    product_ids: [Array],
    notes: String
});

module.exports = mongoose.model('orders', orders);