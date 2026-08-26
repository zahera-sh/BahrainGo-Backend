const mongoose = require("mongoose");


const challengeSchema = new mongoose.Schema({

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        required: true,
        enum: [
            "Community", "Wellness", "Adventure",
            "Bucket List", "Exclusive", "Local",
            "Food", "Fitness", "Exploration",
            "Social", "Business", "Other"
        ]
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 30
    },

    photo: {
        type: String
    },

    isMeasurable: {
        type: Boolean,
        default: false
    },

    goal: {
        type: Number,
        default: 1,
        min: 1
    },

    startTime: {
        type: Date,
    },

    endTime: {
        type: Date,
    },

    isPublic: {
        type: Boolean,
        default: true
    },

    reward: {
        type: Number,
        default: 0,
        min: 0
    },

    businessReward: {
        type: String,
        trim: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


const Challenge = mongoose.model("Challenge", challengeSchema);
module.exports = Challenge;