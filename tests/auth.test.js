require("dotenv").config({
    path: ".env.test",
});


const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

const User = require("../models/User");


beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});


afterEach(async () => {
    await User.deleteMany({});
});


afterAll(async () => {
    await mongoose.connection.close();
});


describe("Auth Routes", () => {



    describe("POST /auth/sign-up", () => {


        test("creates a new user", async () => {

            const response = await request(app)
                .post("/auth/sign-up")
                .send({
                    username: "zee",
                    email: "zee@example.com",
                    password: "password123"
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.username)
                .toBe("zee");

            expect(response.body.email)
                .toBe("zee@example.com");

            expect(response.body.hashedPassword)
                .toBeUndefined();

        });


        test("does not allow duplicate usernames", async () => {

            await User.create({
                username: "zee",
                email: "zee1@example.com",
                hashedPassword: "hashedpassword"
            });

            const response = await request(app)
                .post("/auth/sign-up")
                .send({
                    username: "zee",
                    email: "zee2@example.com",
                    password: "password123"
                });

            expect(response.statusCode)
                .toBe(409);

            expect(response.body.message)
                .toBe("Username is already taken.");

        });


        test("does not allow duplicate emails", async () => {

            await User.create({
                username: "zee1",
                email: "zee@example.com",
                hashedPassword: "hashedpassword"
            });

            const response = await request(app)
                .post("/auth/sign-up")
                .send({
                    username: "zee2",
                    email: "zee@example.com",
                    password: "password123"
                });

            expect(response.statusCode)
                .toBe(409);

            expect(response.body.message)
                .toBe("Email address is already registered.");

        });


        test("does not allow signup when missing username, email or password", async () => {

            const response = await request(app)
                .post("/auth/sign-up")
                .send({
                    username: "zee",
                });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBeDefined()

        });

    });



    describe("POST /auth/sign-in", () => {


        beforeEach(async () => {

            await User.create({
                username: "zee",
                email: "zee@example.com",
                hashedPassword: "$2b$12$LQv3c1y8f5k7H5x..."
            });

        });


        test("requires username and password", async () => {

            const response = await request(app)
                .post("/auth/sign-in")
                .send({
                    username: "zee"
                });

            expect(response.statusCode)
                .toBe(400);

            expect(response.body.message)
                .toBe("Username and password are required.");

        });


        test("rejects invalid username", async () => {

            const response = await request(app)
                .post("/auth/sign-in")
                .send({
                    username: "doesnotexist",
                    password: "password123"
                });

            expect(response.statusCode)
                .toBe(401);

            expect(response.body.message)
                .toBe("Invalid credentials.");

        });


        test("rejects incorrect password", async () => {

            const response = await request(app)
                .post("/auth/sign-in")
                .send({
                    username: "zee",
                    password: "wrongpassword"
                });

            expect(response.statusCode)
                .toBe(401);

            expect(response.body.message)
                .toBe("Invalid credentials.");

        });

    });

});