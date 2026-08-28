const Challenge = require("../models/Challenge");
const User = require("../models/User");
const Participant = require("../models/Participant");
const Invite = require("../models/Invite");


async function createInvite(req, res) {

    try {
        const {
            invitee,
            challenge
        } = req.body;

        const user = await User.findOne({ username: invitee });

        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found" });
        }

        const createdInvite = await Invite.create({
            inviter: req.user._id,
            invitee: user._id,
            challenge
        });

        res
            .status(201)
            .json(createdInvite);
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

async function getMyInvites(req, res) {

    try {
        const invites = await Invite.find({ invitee: req.user._id })
            .populate("inviter")
            .populate("challenge");

        res
            .status(200)
            .json(invites);

    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function acceptInvite(req, res) {

    try {
        const invite = await Invite.findById(req.params.id);

        if (!invite) {
            return res
                .status(404)
                .json({ message: "Invite not found." });
        }

        if (invite.invitee.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        invite.isAccepted = true;
        invite.isRejected = false;

        await invite.save();

        await Participant.create({
            userId: invite.invitee,
            challengeId: invite.challenge
        });

        res
            .status(200)
            .json(invite);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function rejectInvite(req, res) {

    try {
        const invite = await Invite.findById(req.params.id);

        if (!invite) {
            return res
                .status(404)
                .json({ message: "Invite not found." });
        }

        if (invite.invitee.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        invite.isRejected = true;
        invite.isAccepted = false;

        await invite.save();
        res
            .status(200)
            .json(invite);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function dropChallenge(req, res) {

    try {
        const invite = await Invite.findById(req.params.id);

        if (!invite) {
            return res
                .status(404)
                .json({ message: "Invite not found." });
        }

        if (invite.invitee.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        if (!invite.isAccepted) {
            return res
                .status(400)
                .json({ message: "You must accept the challenge before dropping it.." });
        }

        invite.isDropped = true;

        await invite.save();

        await Participant.findOneAndDelete({
            userId: invite.invitee,
            challengeId: invite.challenge
        });

        res
            .status(200)
            .json(invite);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

module.exports = {
    createInvite,
    getMyInvites,
    acceptInvite,
    rejectInvite,
    dropChallenge
};