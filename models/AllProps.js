const mongoose = require('mongoose');

const allPropsSchema = new mongoose.Schema({
    ownerId: {type: mongoose.Types.ObjectId, ref: 'User'},
    title: String,
    price: Number,
    images: [String],
    imagesId: [String],
    options: String,
    rooms: Number,
    bathrooms: Number,
    description: String,
    location: {
        state: String,
        town: String,
        street: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AllProps', allPropsSchema);