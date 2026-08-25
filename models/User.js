const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    hashedPassword: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["user", "admin", "business"],
        default: "user"
    },

    points: {
        type: Number,
        default: 0,
        min: 0
    },

    badges: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
    }

}, { timestamps: true });

userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword;
    },
});


const User = mongoose.model("User", userSchema);
module.exports = User;