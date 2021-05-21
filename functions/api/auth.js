const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
//const firebase = require("firebase");
const firebase = require("../config/firebase");

// var firebaseConfig = {
//     apiKey: "AIzaSyDTsWh-ATsI14WVBvg_dHisp59_BsUcNy0",
//     authDomain: "iattend-e19c5.firebaseapp.com",
//     databaseURL: "https://iattend-e19c5-default-rtdb.firebaseio.com",
//     projectId: "iattend-e19c5",
//     storageBucket: "iattend-e19c5.appspot.com",
//     messagingSenderId: "695692245695",
//     appId: "1:695692245695:web:246ea36c29f784c8cf240a",
//     measurementId: "G-9S6T9D2GXX",
// };
// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
//firebase.analytics();
// // Fetch the service account key JSON file contents
// var serviceAccount = require("../iattendservice.json");

// // Initialize the app with a service account, granting admin privileges
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://iattend-e19c5-default-rtdb.firebaseio.com/",
// });

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

            this.responseCode = "00";
            this.message = "Login successful";
            this.dataObject = user;
            //statusCode = 200;

            functions.logger.log("User", user);
            functions.logger.log("Email", responseCode + message + dataObject);
            return user;
        })
        .catch((error) => {
            this.responseCode = "99";
            this.message = error.message;
            this.dataObject = error;
            //statusCode = 500;

            functions.logger.log("No user", error);
            functions.logger.log("No user", error.message);
        });

    res.status(200).json({
        responseCode: responseCode,
        responseMessage: message,
        responseData: dataObject,
    });
});

router.post("/signup", async(req, res, next) => {
    var data = req.body;
    var email = data.email;
    var password = data.password;
    var firstName = data.firstName;
    var lastName = data.lastName;
    var groupId = data.groupId;

    var responseCode = " ";
    var message = " ";
    var dataObject = null;
    //var statusCode = 200;

    console.log("Email" + email + "Password" + password);
    functions.logger.log("Email", email);
    functions.logger.log("Password", password);

    //Sign in with firebase
    //admin.auth().createUser()
    admin
        .auth()
        .createUser({
            email: "user@example.com",
            emailVerified: false,
            phoneNumber: "+11234567890",
            password: "secretPassword",
            displayName: "John Doe",
            photoURL: "http://www.example.com/12345678/photo.png",
            disabled: false,
        })
        .then((userCredential) => {
            // Signed in
            var user = userCredential;

            //Store the user details in the user table

            var usersRef = db.ref("users");
            usersRef.set({
                email: {
                    firstName: firstName,
                    lastName: lastName,
                    groupId: groupId,
                    email: email,
                    role: "Member",
                },
            });

            responseCode = "00";
            message = "Login successful";
            dataObject = user;
            //statusCode = 200;

            res.status(200).json({
                responseCode: responseCode,
                responseMessage: message,
                responseData: dataObject,
            });

            return user;
        })
        .catch((error) => {
            responseCode = "99";
            message = error.message;
            dataObject = error;
            //statusCode = 500;

            res.status(500).json({
                responseCode: responseCode,
                responseMessage: message,
                responseData: dataObject,
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