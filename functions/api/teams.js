const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

router.post("/create", async(req, res, next) => {
    var data = req.body;
    var name = data.email;
    var description = data.description;
    var groupId = data.groupId;
    var lastName = data.lastName;

    var role = data.role;

    admin
        .auth()
        .createUser({
            email: email,
            emailVerified: false,
            password: password,
            displayName: firstName + lastName,
            photoURL: "http://www.example.com/12345678/photo.png",
            disabled: false,
        })
        .then(async(userCredential) => {
            // Signed in
            var user = userCredential;

            //Store the user details in the user table

            //Generate User ID
            var userId = uuidv1();
            var memberId = groupId + "-" + userId;

            var usersRef = db.ref("users");
            usersRef.set({
                userId: {
                    firstName: firstName,
                    lastName: lastName,
                    middleName: "",
                    title: "",
                    groupId: groupId,
                    email: email,
                    memberId: memberId,
                    phoneNumbers: [],
                    address: "",
                    teams: [],
                    role: role,
                },
            });

            //Set Custom Claims
            const customClaims = {
                admin: role === "admin" ? true : false,
                accessLevel: 1,
            };

            try {
                // Set custom user claims on this newly created user.
                await admin.auth().setCustomUserClaims(user.uid, customClaims);
            } catch (error) {
                console.log(error);
            }

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Account created successfully",
                responseData: user,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Account creation failed",
                responseData: error,
            });
        });
});