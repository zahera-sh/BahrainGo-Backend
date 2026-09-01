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
                .json({ message: "User not found." });
        }

        if (user.role !== "user") {
            return res
                .status(403)
                .json({ message: "Admin or Businesses cannot be invited to challenges." });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot invite yourself." });
        }

        const challengeData = await Challenge.findOne({ _id: challenge, isDeleted: false });

        if (!challengeData) {
            return res
                .status(404)
                .json({ message: "Challenge not found." });
        }

        if (challengeData.creator.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Only the challenge creator can send invitations." });
        }

        const existingParticipant = await Participant.findOne({ challengeId: challenge, userId: user._id });

        if (existingParticipant) {
            return res
                .status(400)
                .json({ message: "This user is already a participant." });
        }

        const existingInvite = await Invite.findOne({ challenge, invitee: user._id });

        if (existingInvite) {
            return res
                .status(400)
                .json({ message: "This user has already been invited to this challenge." });
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

        if (invite.isAccepted) {
            return res
                .status(400)
                .json({ message: "Invite has already been accepted." });
        }

        if (invite.isRejected) {
            return res
                .status(400)
                .json({ message: "Invite has already been rejected." });
        }

        if (invite.isDropped) {
            return res
                .status(400)
                .json({ message: "Invite has already been dropped." });
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

        if (invite.isAccepted) {
            return res
                .status(400)
                .json({ message: "Invite has already been accepted." });
        }

        if (invite.isRejected) {
            return res
                .status(400)
                .json({ message: "Invite has already been rejected." });
        }

        if (invite.isDropped) {
            return res
                .status(400)
                .json({ message: "Invite has already been dropped." });
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
        const participant = await Participant.findOne({
            userId: req.user._id,
            challengeId: req.params.id
        });

        if (!participant) {
            return res
                .status(404)
                .json({ message: "You are not a participant in this challenge." });
        }

        await Participant.findByIdAndDelete(participant._id);

        await Invite.findOneAndUpdate({
            invitee: req.user._id,
            challenge: req.params.id,
            isAccepted: true
        }, {
            isDropped: true,
            isAccepted: false
        })

        res
            .status(200)
            .json({ message: "You have dropped the challenge." });
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