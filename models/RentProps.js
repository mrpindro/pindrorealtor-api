const mongoose = require('mongoose');

const rentPropsSchema = new mongoose.Schema({
    ownerId: {type: mongoose.Types.ObjectId, ref: 'User'},
    title: {type: String, required: true},
    images: [String],
    imagesId: [String],
    fee: {type: Number, required: true},
    period: {type: String, required: true},
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

module.exports = mongoose.model('RentProps', rentPropsSchema);