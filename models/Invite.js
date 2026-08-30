const mongoose = require("mongoose");


const inviteSchema = new mongoose.Schema({

    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    invitee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },

    isAccepted: {
        type: Boolean,
        default: false
    },

    isRejected: {
        type: Boolean,
        default: false
    },

    receivedAt: {
        type: Date,
        default: Date.now
    },

    isDropped: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

inviteSchema.index(
    { challenge: 1, invitee: 1 },
    { unique: true }
);


const Invite = mongoose.model("Invite", inviteSchema);
module.exports = Invite;