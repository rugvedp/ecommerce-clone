const mongoose = require('mongoose')

const cloths = mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    image: [String],
    cloth_type: String,
    viewcount: {type: Number, default:0},
    purchasedcount: Number,
    isoutofstock: Boolean,
    ratings: [{
        one_star: {type: Number, default: 0},
        two_star: {type: Number, default: 0},
        three_star: {type: Number, default: 0},
        four_star: {type: Number, default: 0},
        five_star: {type: Number, default: 0}
    }],
});
module.exports = mongoose.model('tees', cloths, 'Tees');