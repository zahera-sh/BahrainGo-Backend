const Report = require("../models/Report");
const Challenge = require("../models/Challenge");


async function createReport(req, res) {

    try {
        const {
            reportedChallenge,
            complaintType,
            complaintBody
        } = req.body;

        const challenge = await Challenge.findOne({
            _id: reportedChallenge,
            isDeleted: false
        });

        if (!challenge) {
            return res
                .status(404)
                .json({ message: "Challenge not found." });
        }

        const existingReport = await Report.findOne({
            reporter: req.user._id,
            reportedChallenge
        })

        if (existingReport) {
            return res
                .status(400)
                .json({ message: "You have already reported this challenge." });
        }

        const report = await Report.create({
            reporter: req.user._id,
            reportedChallenge,
            complaintType,
            complaintBody
        })

        res
            .status(201)
            .json(report);

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

async function getReports(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        const reports = await Report.find()
            .populate("reporter")
            .populate("reportedChallenge");

        res
            .status(200)
            .json(reports);

    }

    catch (err) {
        console.log(err);

        return res
            .status(500)
            .json({ message: err.message });
    }

}

async function solveReport(req, res) {

    try {
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Unauthorized action." });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res
                .status(404)
                .json({ message: "Report not found." });
        }

        report.isSolved = true;

        await report.save()

        res
            .status(200)
            .json(report);

    }

    catch (err) {
        console.log(err)

        return res
            .status(500)
            .json({ message: err.message });
    }

}


module.exports = {
    createReport,
    getReports,
    solveReport
}