const mongoose = require('mongoose');

const buyPropsSchema = new mongoose.Schema({
    ownerId: {type: mongoose.Types.ObjectId, ref: 'User'},
    title: {type: String, required: true},
    images: [String],
    imagesId: [String],
    price: {type: Number, required: true},
    option: {type: String, required: true},
    rooms: Number,
    bathrooms: Number,
    description: {type: String, required: true, minLength: 20},
    location: {
        state: {type: String, required: true},
        town: {type: String, required: true},
        street: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BuyProps', buyPropsSchema);