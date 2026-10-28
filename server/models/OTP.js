const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,     
    },
    otp: {
        type: String,
        required: true
    },
action: {
        type: String,
        enum: ['account_verification', 'event_booking', 'password_reset'],
        required: true
},
createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // OTP expires after 10 minutes
    }

});     
module.exports = mongoose.model("OTP", otpSchema);