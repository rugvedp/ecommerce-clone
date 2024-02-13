const mongoose = require('mongoose')

const ordersitems = mongoose.Schema({
    id: Number,
    order_id: Number,
    product_name: String,
    product_id: Number,
    product_price: Number,
    product_image: String,
    product_quantity: Number,
    order_date: Date
});

module.exports = mongoose.model('oderitems', ordersitems);