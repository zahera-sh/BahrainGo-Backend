const Challenge = require("../models/Challenge");
const User = require("../models/User");
const Participant = require("../models/Participant");


async function getMyParticipants(req, res) {

    try {
        const myParticipants = await Participant.find({ userId: req.user._id })
            .populate({
                path: "challengeId",
                populate: {
                    path: "creator"
                }
            })
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
            .populate({
                path: "challengeId",
                populate: {
                    path: "goal"
                }
            })
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

async function updateProgress(req, res) {

    try {
        const { progress, completeAt } = req.body;

        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res
                .status(404)
                .json({ message: "Challenge not found." });
        }

        const isComplete = progress >= challenge.goal;

        const updateData = {
            progress,
            isComplete,
            completeAt
        };

        if (isComplete) {
            updateData.completeAt = new Date();
        }

        const participant = await Participant.findOneAndUpdate({
            userId: req.user._id,
            challengeId: req.params.id
        },
            updateData
        );

        if (!participant) {
            return res
                .status(404)
                .json({ message: "Participant not found." });
        }

        res
            .status(200)
            .json(participant);
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
    updateProgress
};