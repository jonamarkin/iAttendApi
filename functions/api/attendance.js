const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();

var db = admin.database();

router.post("/attendEvent", async(req, res, next) => {
    var data = req.body;
    var email = data.email;
    var password = data.password;

    let responseCode = " ";
    let message = " ";
    let dataObject = null;

    res.status(200).json({
        responseCode: responseCode,
        responseMessage: message,
        responseData: dataObject,
    });
});