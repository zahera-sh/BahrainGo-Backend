const mongoose = require("mongoose");


const badgeSchema = new mongoose.Schema({

        title: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String
        }

    }, { timestamps: true });


const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;