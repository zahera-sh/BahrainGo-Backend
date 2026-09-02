const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Report = require("../models/Report");


async function getUsers(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Admin access required." });
        }

        const users = await User.find();

        return res
            .status(200)
            .json(users);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: "Could not get all the uses at the moment, try again." });
    }

}

async function deleteUser(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Admin access required." });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found" });
        }

        user.isDeleted = true;
        await user.save();

        res
            .status(200)
            .json({ message: "User deleted successfully." });
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: "Could not delete user, try again." });
    }

}

async function getChallenges(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Admin access required." });
        }

        const challenges = await Challenge.find()
            .populate("creator", "username")
            .sort({ createdAt: -1 });

        return res
            .status(200)
            .json(challenges);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: "Could not get all the challenges at the moment, try again." });
    }

}

async function deleteChallenge(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Admin access required." });
        }

        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res
                .status(404)
                .json({ message: "User not found" });
        }

        challenge.isDeleted = true;
        await challenge.save();

        res
            .status(200)
            .json({ message: "Challennge deleted successfully." });
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: "Could not delete challenge, try again." });
    }
}

async function getReports(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Admin access required." });
        }
        const reports = await Report.find()
            .populate("reporter", "username")
            .populate("reportedChallenge")
            .sort({ createdAt: -1 });

        return res
            .status(200)
            .json(reports);
    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: "Could not get all reports at the moment, try again." });
    }

}


module.exports = {
    getUsers,
    deleteUser,
    getChallenges,
    deleteChallenge,
    getReports
};