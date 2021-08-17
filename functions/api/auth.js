const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
//const firebase = require("firebase");
const firebase = require("../config/firebase");

const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const {
    UserDimensions,
} = require("firebase-functions/lib/providers/analytics");
// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();

router.post("/login", async(req, res, next) => {
    var data = req.body;
    var email = data.email;
    var password = data.password;

    let responseCode = " ";
    let message = " ";
    let dataObject = null;
    //var statusCode = 200;

    console.log("Email" + email + "Password" + password);
    functions.logger.log("Email", email);
    functions.logger.log("Password", password);

    //Sign in with firebase

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;

            functions.logger.log("User", user);
            functions.logger.log("Email", responseCode + message + dataObject);

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Success",
                responseData: user,
            });
        })
        .catch((error) => {
            this.responseCode = "999";
            this.message = error.message;
            this.dataObject = error;
            //statusCode = 500;

            functions.logger.log("No user", error);
            functions.logger.log("No user", error.message);

            return res.status(500).json({
                responseCode: "777",
                responseMessage: error.message,
                responseData: error,
            });
        });
});

router.post("/signup", async(req, res, next) => {
    var data = req.body;
    var email = data.email;
    var password = data.password;
    var firstName = data.firstName;
    var lastName = data.lastName;
    var groupId = data.groupId;
    var role = data.role;

    console.log("Email" + email + "Password" + password);
    functions.logger.log("Email", email);
    functions.logger.log("Password", password);

    //Sign in with firebase
    //admin.auth().createUser()
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

router.post("/logout", (req, res, next) => {
    var message;

    res.status(200).json({
        message: message,
    });
});

module.exports = router;