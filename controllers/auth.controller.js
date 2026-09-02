const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


async function signUp(req, res) {

    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res
                .status(400)
                .json({ message: "Username, email and password are required." });

        if (password.length < 9)
            return res
                .status(400)
                .json({ message: "Password must be at least 9 characters." });

        const user = await User.create({
            username,
            email,
            hashedPassword: await bcrypt.hash(password, 12),
        });

        const { _id, createdAt, updatedAt } = user;

        res
            .status(201)
            .json({
                username: user.username,
                email: user.email,
                _id,
                createdAt,
                updatedAt
            });
    }

    catch (err) {
        console.log(err);

        if (err.name === "ValidationError") {
            return res
                .status(400)
                .json({ message: err.message });
        }

        if (err.code === 11000) {
            if (err.keyValue.email) {
                return res.status(409)
                    .json({ message: "Email address is already registered." });
            }

            if (err.keyValue.username) {
                return res.status(409)
                    .json({ message: "Username is already taken." });
            }
        }

        console.log(err);
        return res
            .status(500)
            .json({ message: "An unexpected error occurred." });
    }

}

async function signIn(req, res) {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required." });
        }

        const user = await User.findOne({ username: username.toLowerCase().trim() });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid credentials." });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.hashedPassword,
        );

        if (!isPasswordCorrect) {
            return res
                .status(401)
                .json({ message: "Invalid credentials." });
        }

        // construct the payload
        const payload = {
            username: user.username,
            _id: user._id,
            role: user.role
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET,
            { expiresIn: "23h" });

        return res
            .status(200)
            .json({
                accessToken,
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
            });
    }

    catch (err) {
        console.error(err);

        return res
            .status(500)
            .json({ message: "An unexpected error occurred." });
    }

}

async function verifyUser(req, res) {

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found." });
        }

        return res
            .status(200)
            .json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                points: user.points,
                badges: user.badges,
                createdAt: user.createdAt

            });
    }

    catch (err) {
        console.error(err);

        return res
            .status(500)
            .json({ message: "An unexpected error occurred." });
    }
}


module.exports = {
    signUp,
    signIn,
    verifyUser,
};