const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, maxLength: 50, minLength: 3 },
    email: { type: String, required: true, minLength: 5, unique: true },
    phoneNum: {type: Number, required: true},
    image: String,
    imageId: String,
    password: { type: String, required: true, minLength: 4 },
    roles: {type: [String], default:['user']},
    messages: [{
        message: String,
        sender: String
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);