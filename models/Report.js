const mongoose = require("mongoose");


const reportSchema = new mongoose.Schema({

    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reportedChallenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    },

    complaintType: {
        type: String,
        required: true,
        enum: [
            "Harmful or Dangerous Content",
            "Harrassment or Hate Speech",
            "Sexual or Inappropriate Content",
            "Privacy or Personal Information",
            "Fraud or Scam",
            "Reward Not Provided",
            "Reward or Challange Misrepresentation",
            "Violation of Terms of Service",
            "Spam or Misleading Content",
            "Other"
        ]
    },

    complaintBody: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true });


const Report = mongoose.model("Report", reportSchema);
module.exports = Report;