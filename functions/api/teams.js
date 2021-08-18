const express = require("express");
const randomToken = require("random-token");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const db = admin.firestore();
router.post("/create", async(req, res, next) => {
    var data = req.body;
    var name = data.email;
    var description = data.description;
    var groupId = data.groupId;
    var createdBy = data.uid;

    var teamId = uuidv1();

    db.collection("teams")
        .doc(teamId)
        .set({
            name: name,
            teamId: teamId,
            description: description,
            groupId: groupId,
            createdBy: createdBy,
        })
        .then((response) => {
            return res.status(200).json({
                responseCode: "000",
                responseMessage: "Team created successfully!",
                responseData: response,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                responseCode: "777",
                responseMessage: "Team creation failed!",
                responseData: error,
            });
        });
});