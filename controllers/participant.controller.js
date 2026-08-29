const Challenge = require("../models/Challenge");
const User = require("../models/User");
const Participant = require("../models/Participant");


async function getMyParticipants(req, res) {

    try {
        const myParticipants = await Participant.find({ userId: req.user._id })
            .populate("challengeId")
            .populate("userId");

        res
            .status(200)
            .json(myParticipants);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function getParticipants(req, res) {

    try {
        const participants = await Participant.find({ challengeId: req.params.id })
            .populate("challengeId")
            .populate("userId");

        res
            .status(200)
            .json(participants);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}


module.exports = {
    getMyParticipants,
    getParticipants,
};