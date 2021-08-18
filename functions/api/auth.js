const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
//const firebase = require("firebase");
const firebase = require("../config/firebase");
const nodemailer = require("nodemailer");

const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const {
    UserDimensions,
} = require("firebase-functions/lib/providers/analytics");
// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.firestore();
//var firestore = admin.firestore();

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
            displayName: firstName + " " + lastName,
            photoURL: "http://www.example.com/12345678/photo.png",
            disabled: false,
        })
        .then(async(userCredential) => {
            // Signed in
            var user = userCredential;

            functions.logger.log("User", userCredential);

            //Store the user details in the user table

            //Generate User ID
            var userId = user.uid;
            var memberId = groupId + "-" + userId;

            var usersRef = db.collection("users");
            usersRef.doc(userId).set({
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
                responseMessage: "Failed! " + error.message,
                responseData: error,
            });
        });
});

router.post("/updateUser", async(req, res, next) => {
    var data = req.body;
    var email = data.email;
    var password = data.password;
    var firstName = data.firstName;
    var lastName = data.lastName;
    var groupId = data.groupId;
    var role = data.role;
    var uid = data.uid;
    var title = data.title;
    var memberId = data.memberId;

    var middleName = data.middleName;
    var phoneNumbers = data.phoneNumbers;
    var address = data.address;

    console.log("Email" + email + "Password" + password);
    functions.logger.log("Email", email);
    functions.logger.log("Phone", phoneNumbers[0]);

    var primaryPhone = phoneNumbers[0];
    functions.logger.log("Primary", primaryPhone);

    admin
        .auth()
        .updateUser(uid, {
            email: email,
            emailVerified: true,
            password: password,
            displayName: firstName + " " + lastName,
            // photoURL: "",
            disabled: false,
        })
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
            functions.logger.log("Successfully updated user", userRecord.toJSON());

            var usersRef = db.collection("users");
            usersRef.doc(uid).set({
                firstName: firstName,
                lastName: lastName,
                middleName: middleName,
                title: title,
                groupId: groupId,
                email: email,
                memberId: memberId,
                phoneNumbers: phoneNumbers,
                address: address,
                teams: [],
                role: role,
            });

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Successfully updated user",
                //responseData: error,
            });
        })
        .catch((error) => {
            console.log("Error updating user:", error);
            functions.logger.log(error);

            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Error updating user",
                responseData: error,
            });
        });
});

router.post("/resetPassword", (req, res, next) => {
    var data = req.body;

    // Admin SDK API to generate the password reset link.
    const userEmail = data.email;

    functions.logger.log(userEmail);

    admin
        .auth()
        .generatePasswordResetLink(userEmail)
        .then((link) => {
            // Construct password reset email template, embed the link and send
            // using custom SMTP server.

            functions.logger.log("Link: " + link);
            sendCustomPasswordResetEmail(userEmail, userEmail, link);

            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Password reset email sent to " + userEmail,
            });
        })
        .catch((error) => {
            // Some error occurred.
            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Password reset failed",
                responseData: error,
            });
        });
});

function sendCustomPasswordResetEmail(userEmail, displayName, link) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: "jamapps10@gmail.com",
            pass: "JAMapps10@@",
        },
    });
    //transporter.verify().then(console.log).catch(console.error);

    functions.logger.log("Link oooooooo ");
    functions.logger.log(link);

    transporter
        .sendMail({
            from: '"JamApps" <jamapps10@gmail>', // sender address
            to: userEmail, // list of receivers
            subject: "iAttend Password Reset", // Subject line
            text: "Click this link to reset your password! " + link, // plain text body
            html: `<b>Click this link to reset your password!</b> <hr/> <a href= "${link}"
                >Password Reset</a>`,
            // html body
        })
        .then((info) => {
            return console.log({ info });
        })
        .catch(console.error);
}

module.exports = router;