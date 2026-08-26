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
const Invite = require("../models/Invite");
const Participant = require("../models/Participant");


beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});


afterEach(async () => {
    await User.deleteMany({});
    await Challenge.deleteMany({});
    await Invite.deleteMany({});
    await Participant.deleteMany({});
});


afterAll(async () => {
    await mongoose.connection.close();
});


describe("Invite Routes", () => {

    describe("POST /invites", () => {

        test("creates an invite", async () => {

            const inviter = await User.create({
                username: "inviter",
                email: "inviter@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const invitee = await User.create({
                username: "invitee",
                email: "invitee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: inviter._id,
                type: "Fitness",
                description: "Complete a fitness challenge together with another user.",
                isPublic: true
            });

            const token = jwt.sign(
                {
                    _id: inviter._id,
                    role: inviter.role
                },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .post("/invites")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    invitee: invitee._id,
                    challenge: challenge._id
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.inviter)
                .toBe(inviter._id.toString());

            expect(response.body.invitee)
                .toBe(invitee._id.toString());

            expect(response.body.challenge)
                .toBe(challenge._id.toString());

            expect(response.body.isAccepted)
                .toBe(false);

            expect(response.body.isRejected)
                .toBe(false);

            expect(response.body.isDropped)
                .toBe(false);
        });


        test("does not create an invite without authentication", async () => {

            const response = await request(app)
                .post("/invites")
                .send({
                    invitee: new mongoose.Types.ObjectId(),
                    challenge: new mongoose.Types.ObjectId()
                });

            expect(response.statusCode).toBe(401);
        });

    });


    describe("GET /invites", () => {

        test("returns the logged-in user's invites", async () => {

            const inviter = await User.create({
                username: "inviter",
                email: "inviter@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const invitee = await User.create({
                username: "invitee",
                email: "invitee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: inviter._id,
                type: "Fitness",
                description: "Complete a fitness challenge together with another user.",
                isPublic: true
            });

            await Invite.create({
                inviter: inviter._id,
                invitee: invitee._id,
                challenge: challenge._id
            });

            const token = jwt.sign(
                {
                    _id: invitee._id,
                    role: invitee.role
                },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .get("/invites")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body)
                .toHaveLength(1);

            expect(response.body[0].invitee)
                .toBe(invitee._id.toString());
        });


        test("does not allow unauthenticated users to view invites", async () => {

            const response = await request(app)
                .get("/invites");

            expect(response.statusCode).toBe(401);
        });

    });


    describe("PUT /invites/:id/accept", () => {

        test("allows the invitee to accept an invite", async () => {

            const inviter = await User.create({
                username: "inviter",
                email: "inviter@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const invitee = await User.create({
                username: "invitee",
                email: "invitee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: inviter._id,
                type: "Fitness",
                description: "Complete a fitness challenge together with another user.",
                isPublic: true
            });

            const invite = await Invite.create({
                inviter: inviter._id,
                invitee: invitee._id,
                challenge: challenge._id
            });

            const token = jwt.sign(
                {
                    _id: invitee._id,
                    role: invitee.role
                },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .put(`/invites/${invite._id}/accept`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.isAccepted)
                .toBe(true);

            expect(response.body.isRejected)
                .toBe(false);

            const participant = await Participant.findOne({
                userId: invitee._id,
                challengeId: challenge._id
            });

            expect(participant).not.toBeNull();

            expect(participant.userId.toString())
                .toBe(invitee._id.toString());

            expect(participant.challengeId.toString())
                .toBe(challenge._id.toString());
        });


        test("does not allow another user to accept the invite", async () => {

            const inviter = await User.create({
                username: "inviter",
                email: "inviter@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const invitee = await User.create({
                username: "invitee",
                email: "invitee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const otherUser = await User.create({
                username: "otheruser",
                email: "other@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: inviter._id,
                type: "Fitness",
                description: "Complete a fitness challenge together with another user.",
                isPublic: true
            });

            const invite = await Invite.create({
                inviter: inviter._id,
                invitee: invitee._id,
                challenge: challenge._id
            });

            const token = jwt.sign(
                {
                    _id: otherUser._id,
                    role: otherUser.role
                },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .put(`/invites/${invite._id}/accept`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(403);
        });

    });


    describe("PUT /invites/:id/reject", () => {

        test("allows the invitee to reject an invite", async () => {

            const inviter = await User.create({
                username: "inviter",
                email: "inviter@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const invitee = await User.create({
                username: "invitee",
                email: "invitee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: inviter._id,
                type: "Fitness",
                description: "Complete a fitness challenge together with another user.",
                isPublic: true
            });

            const invite = await Invite.create({
                inviter: inviter._id,
                invitee: invitee._id,
                challenge: challenge._id
            });

            const token = jwt.sign(
                {
                    _id: invitee._id,
                    role: invitee.role
                },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .put(`/invites/${invite._id}/reject`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.isAccepted)
                .toBe(false);

            expect(response.body.isRejected)
                .toBe(true);
        });

    });


    describe("PUT /invites/:id/drop", () => {

        test("allows an accepted invitee to drop the challenge", async () => {

            const inviter = await User.create({
                username: "inviter",
                email: "inviter@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const invitee = await User.create({
                username: "invitee",
                email: "invitee@example.com",
                hashedPassword: await bcrypt.hash("password123", 12)
            });

            const challenge = await Challenge.create({
                creator: inviter._id,
                type: "Fitness",
                description: "Complete a fitness challenge together with another user.",
                isPublic: true
            });

            const invite = await Invite.create({
                inviter: inviter._id,
                invitee: invitee._id,
                challenge: challenge._id,
                isAccepted: true
            });

            await Participant.create({
                userId: invitee._id,
                challengeId: challenge._id
            });

            const token = jwt.sign(
                {
                    _id: invitee._id,
                    role: invitee.role
                },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .put(`/invites/${invite._id}/drop`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.isAccepted)
                .toBe(true);

            expect(response.body.isDropped)
                .toBe(true);

            const participant = await Participant.findOne({
                userId: invitee._id,
                challengeId: challenge._id
            });

            expect(participant).toBeNull();
        });

    });

});