const Challenge = require("../models/Challenge");
const User = require("../models/User");
const Participant = require("../models/Participant");


async function createChallenge(req, res) {

    try {
        const {
            type,
            description,
            photo,
            isMeasurable,
            goal,
            startTime,
            endTime,
            isPublic,
            reward,
            businessReward,
        } = req.body;

        const createdChallenge = await Challenge.create({
            creator: req.user._id,
            type,
            description,
            photo,
            isMeasurable,
            goal,
            startTime,
            endTime,
            isPublic: req.user.role == "admin" || req.user.role == "business"
                ? isPublic
                : false,
            reward,
            businessReward,
        });

        await Participant.create({
            userId: req.user._id,
            challengeId: createdChallenge._id
        });

        res
            .status(201)
            .json(createdChallenge);
    }

    catch (err) {
        console.log(err);

        if (err.name === "ValidationError") {
            return res
                .status(400)
                .json({ message: err.message });
        }

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function getPublicChallenges(req, res) {

    try {
        const publicChallenges = await Challenge.find({ isDeleted: false, isPublic: true }).populate("creator");

        res
            .status(200)
            .json(publicChallenges);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function getMyChallenges(req, res) {

    try {
        const myChallenges = await Challenge.find({ creator: req.user._id, isDeleted: false });

        res
            .status(200)
            .json(myChallenges);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function deleteChallanenge(req, res) {

    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res
                .status(404)
                .json({ message: "Challenge not found." });
        }

        if (challenge.creator.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        challenge.isDeleted = true;
        await challenge.save();

        res
            .status(200)
            .json({ message: "Challenge deleted." });
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function getChallengeById(req, res) {

    try {
        const challenge = await Challenge.findOne({ _id: req.params.id, isDeleted: false })
            .populate("creator");

        if (!challenge) {
            return res
                .status(404)
                .json({ message: "Challenge not found." });
        }

        if (!challenge.isPublic &&
            challenge.creator._id.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        res
            .status(200)
            .json(challenge);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

module.exports = {
    createChallenge,
    getPublicChallenges,
    getMyChallenges,
    deleteChallanenge,
    getChallengeById,
};