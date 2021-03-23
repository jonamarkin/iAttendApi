const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");

const router = express.Router();

router.post("/login", async(req, res, next) => {
    var data = req.body;
    var email = data.email;
    var password = data.password;

    var responseCode;
    var message;
    var dataObject;
    var statusCode = 200;

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

            responseCode = "00";
            message = "Login successful";
            dataObject = user;
            statusCode = 200;
            return user;
        })
        .catch((error) => {
            responseCode = "99";
            message = error.message;
            dataObject = error;
            statusCode = 500;
        });

    res.status(statusCode).json({
        responseCode: responseCode,
        responseMessage: message,
        responseData: dataObject,
    });
});

router.post("/logout", (req, res, next) => {
    var message;
    firebase
        .auth()
        .signOut()
        .then(() => {
            // Sign-out successful.
            message = "Successful";
            return message;
        })
        .catch((error) => {
            // An error happened.
        });

    res.status(200).json({
        message: message,
    });
});