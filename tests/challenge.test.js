require("dotenv").config({
    path: ".env.test",
});

const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../app");

const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Participant = require("../models/Participant");


beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});


afterEach(async () => {
    await User.deleteMany({});
    await Challenge.deleteMany({});
    await Participant.deleteMany({});
});


afterAll(async () => {
    await mongoose.connection.close();
});


describe("Challenge Routes", () => {


    describe("POST /challenges", () => {


        test("creates a private challenge for a normal user", async () => {

            const user = await User.create({
                username: "zee",
                email: "zee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12),
                role: "user"
            });


            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "23h"
                }
            );


            const response = await request(app)
                .post("/challenges")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "Food",
                    description:
                        "Visit three different local coffee shops in Bahrain and try a drink you have never ordered before.",
                    photo: "https://example.com/coffee.jpg",
                    isMeasurable: true,
                    goal: 3,
                    startTime: "2026-08-26T08:00:00.000Z",
                    endTime: "2026-09-10T23:59:59.000Z",
                    reward: 100,
                    businessReward: "Free drink after completing the challenge"
                });


            expect(response.statusCode)
                .toBe(201);

            expect(response.body.creator)
                .toBe(user._id.toString());

            expect(response.body.type)
                .toBe("Food");

            expect(response.body.description)
                .toBe(
                    "Visit three different local coffee shops in Bahrain and try a drink you have never ordered before."
                );

            expect(response.body.isMeasurable)
                .toBe(true);

            expect(response.body.goal)
                .toBe(3);

            expect(response.body.reward)
                .toBe(100);

            expect(response.body.isPublic)
                .toBe(false);

            const participant = await Participant.findOne({
                userId: user._id,
                challengeId: response.body._id
            });

            expect(participant).not.toBeNull();

            expect(participant.userId.toString())
                .toBe(user._id.toString());

            expect(participant.challengeId.toString())
                .toBe(response.body._id.toString());

            expect(participant.progress)
                .toBe(0);

            expect(participant.isComplete)
                .toBe(false);
                
        });


        test("does not allow a normal user to create a public challenge", async () => {

            const user = await User.create({
                username: "zee",
                email: "zee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12),
                role: "user"
            });


            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "23h"
                }
            );


            const response = await request(app)
                .post("/challenges")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "Food",
                    description:
                        "Visit three different local coffee shops in Bahrain and try a drink you have never ordered before.",
                    isPublic: true
                });


            expect(response.statusCode)
                .toBe(201);

            expect(response.body.isPublic)
                .toBe(false);

        });


        test("does not create a challenge without authentication", async () => {

            const response = await request(app)
                .post("/challenges")
                .send({
                    type: "Food",
                    description:
                        "Visit three different local coffee shops in Bahrain and try a drink you have never ordered before."
                });


            expect(response.statusCode)
                .toBe(401);

        });


        test("does not create a challenge with invalid data", async () => {

            const user = await User.create({
                username: "zee",
                email: "zee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12),
                role: "user"
            });


            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "23h"
                }
            );


            const response = await request(app)
                .post("/challenges")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "Not a real type",
                    description: "Too short"
                });


            expect(response.statusCode)
                .toBe(400);

        });

    });


    describe("GET /challenges", () => {

        test("returns public challenges", async () => {

            const user = await User.create({
                username: "creator",
                email: "creator@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            await Challenge.create({
                creator: user._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: true
            });

            const response = await request(app)
                .get("/challenges");

            expect(response.statusCode)
                .toBe(200);

            expect(response.body)
                .toHaveLength(1);

            expect(response.body[0].isPublic)
                .toBe(true);

        });


        test("does not return private challenges", async () => {

            const user = await User.create({
                username: "creator",
                email: "creator@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            await Challenge.create({
                creator: user._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: false
            });

            const response = await request(app)
                .get("/challenges");

            expect(response.statusCode)
                .toBe(200);

            expect(response.body)
                .toHaveLength(0);

        });


        test("does not require authentication", async () => {

            const response = await request(app)
                .get("/challenges");

            expect(response.statusCode)
                .toBe(200);

        });

    });


    describe("GET /challenges/my-challenges", () => {

        test("returns the logged-in user's challenges", async () => {

            const user = await User.create({
                username: "creator",
                email: "creator@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "23h" }
            );

            await Challenge.create({
                creator: user._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: false
            });

            const response = await request(app)
                .get("/challenges/my-challenges")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode)
                .toBe(200);

            expect(response.body)
                .toHaveLength(1);

            expect(response.body[0].creator)
                .toBe(user._id.toString());

        });


        test("does not return another user's challenges", async () => {

            const user1 = await User.create({
                username: "creator1",
                email: "creator1@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const user2 = await User.create({
                username: "creator2",
                email: "creator2@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const token = jwt.sign(
                {
                    _id: user1._id,
                    username: user1.username,
                    role: user1.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "23h" }
            );

            await Challenge.create({
                creator: user2._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: false
            });

            const response = await request(app)
                .get("/challenges/my-challenges")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode)
                .toBe(200);

            expect(response.body)
                .toHaveLength(0);

        });


        test("does not allow unauthenticated users to view their challenges", async () => {

            const response = await request(app)
                .get("/challenges/my-challenges");

            expect(response.statusCode)
                .toBe(401);

        });

    });


    describe("DELETE /challenges/:id", () => {

        test("allows the owner to delete their challenge", async () => {

            const user = await User.create({
                username: "owner",
                email: "owner@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "23h" }
            );

            const challenge = await Challenge.create({
                creator: user._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: false
            });

            const response = await request(app)
                .delete(`/challenges/${challenge._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode)
                .toBe(200);

            expect(response.body.message)
                .toBe("Challenge deleted.");

            const deletedChallenge = await Challenge.findById(challenge._id);

            expect(deletedChallenge.isDeleted)
                .toBe(true);

        });


        test("does not allow another user to delete the challenge", async () => {

            const owner = await User.create({
                username: "owner",
                email: "owner@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const otherUser = await User.create({
                username: "otheruser",
                email: "other@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const token = jwt.sign(
                {
                    _id: otherUser._id,
                    username: otherUser.username,
                    role: otherUser.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "23h" }
            );

            const challenge = await Challenge.create({
                creator: owner._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: false
            });

            const response = await request(app)
                .delete(`/challenges/${challenge._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode)
                .toBe(403);

            expect(response.body.message)
                .toBe("Unauthorized action.");

            const unchangedChallenge = await Challenge.findById(challenge._id);

            expect(unchangedChallenge.isDeleted)
                .toBe(false);

        });


        test("does not allow unauthenticated users to delete a challenge", async () => {

            const user = await User.create({
                username: "owner",
                email: "owner@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: user._id,
                type: "Adventure",
                description: "Explore a new place and complete this exciting adventure challenge.",
                isPublic: false
            });

            const response = await request(app)
                .delete(`/challenges/${challenge._id}`);

            expect(response.statusCode)
                .toBe(401);

        });


        test("returns 404 when challenge does not exist", async () => {

            const user = await User.create({
                username: "owner",
                email: "owner@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "23h" }
            );

            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/challenges/${fakeId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode)
                .toBe(404);

            expect(response.body.message)
                .toBe("Challenge not found.");

        });

    });

});