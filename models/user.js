var mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: Number,
    email: String,
    mfaEnrolled: Boolean
});