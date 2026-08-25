const mongoose = require("mongoose");


const participantSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },

    progress: {
        type: Number,
        default: 0,
        min: 0
    },

    isComplete: {
        type: Boolean,
        default: false
    },

    completeAt: {
        type: Date
    }

}, { timestamps: true });


const Participant = mongoose.model("Participant", participantSchema);
module.exports = Participant;